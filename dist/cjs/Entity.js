"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchContext = exports.setWatchContext = void 0;
const immer_1 = require("immer");
const remeda_1 = require("remeda");
const EntityField_1 = require("./EntityField");
const MockEntityManager_1 = require("./MockEntityManager");
const getEntityTypeName_1 = require("./getEntityTypeName");
(0, immer_1.enablePatches)();
if (typeof window !== "undefined") {
    const w = window;
    w.devtoolsFormatters = [
        ...(w.devtoolsFormatters ?? []),
        {
            header: function (obj) {
                if (obj instanceof Entity) {
                    return ["div", {}, (0, getEntityTypeName_1.getEntityTypeName)(obj) + ":" + obj.id];
                }
                return null;
            },
            hasBody: function (obj) {
                if (obj instanceof Entity) {
                    return true;
                }
                return false;
            },
            body: function (obj, config) {
                if (obj instanceof Entity) {
                    const elements = Object.entries(obj.getEntityFieldValues()).map(function ([key, value]) {
                        var child;
                        if (typeof value === "object" && value !== null) {
                            child = [
                                "object",
                                {
                                    object: value,
                                    config: {
                                        key: key,
                                    },
                                },
                            ];
                        }
                        else {
                            child = ["span", {}, key + ": " + (value?.toString() ?? String(value))];
                        }
                        return ["div", { style: "margin: 5px 0;" }, ["span", {}, key + ": "], child];
                    });
                    return ["div", {}, ...elements];
                }
                return null;
            },
        },
    ];
}
let watchContext = null;
function setWatchContext(ctx) {
    watchContext = ctx;
}
exports.setWatchContext = setWatchContext;
function getWatchContext() {
    return watchContext;
}
exports.getWatchContext = getWatchContext;
class Entity {
    manager;
    static type = "string";
    static createdIds = [];
    id;
    revisionNumber = 0;
    config;
    isApplyingWatchUpdates = false;
    // If we use EntityField decorator here, for some reason this breaks.
    // So we hardcode them as entity fields by concating their names further down below
    createdAt = new Date();
    updatedAt = new Date();
    draft;
    patches = [];
    get isNew() {
        return !this.id;
    }
    get isDirty() {
        return this.patches.length;
    }
    _proxy;
    onHydrated() { }
    update(_opts, _callback) {
        const callback = _callback ?? _opts;
        const opts = typeof _opts !== "function" ? _opts : {};
        const withPatches = (0, immer_1.produceWithPatches)(this.draft, (draft) => {
            // @ts-ignore
            callback(draft);
        });
        const [newDraft, patches] = withPatches;
        if (patches.length > 0) {
            const [newNewDraft, newNewPatches] = (0, immer_1.produceWithPatches)(newDraft, (draft) => {
                // @ts-ignore
                if (!opts.stealth) {
                    draft.updatedAt = new Date();
                    if (!draft.createdAt) {
                        draft.createdAt = new Date();
                    }
                }
            });
            // if actual changes have been made
            if (!this.isApplyingWatchUpdates) {
                this.revisionNumber++;
            }
            this.patches.push(...patches, ...newNewPatches);
            this.draft = newNewDraft;
            if (!this.isApplyingWatchUpdates) {
                this.writePendingUpdates();
            }
        }
    }
    updateObject(field, value) {
        this[field] = { ...this[field], ...value };
    }
    updateArray(field, index, value) {
        if (typeof index === "number") {
            this[field] = [...this[field].slice(0, index), value, ...this[field].slice(index + 1)];
        }
        else {
            const itemIndex = this[field].findIndex(index);
            if (itemIndex !== -1) {
                this[field] = [...this[field].slice(0, itemIndex), value, ...this[field].slice(itemIndex + 1)];
            }
        }
    }
    constructor(manager, id, data, config) {
        this.manager = manager;
        this.id = id;
        // if (Entity.createdIds.includes(id)) {
        //   debugger
        //   console.warn(`Entity with id ${id} already exists`)
        // }
        // Entity.createdIds.push(id)
        const { revisionNumber, ...theData } = data || { revisionNumber: 0 };
        this.draft = (0, immer_1.produce)(theData, () => { });
        this.revisionNumber = revisionNumber || 0;
        this.config = config;
        const proxy = new Proxy(this, {
            set: (target, property, _value) => {
                let value = _value;
                const isTrackableProperty = this.getEntityFields().includes(property);
                if (!isTrackableProperty) {
                    target[property] = value;
                    return true;
                }
                const setter = Reflect.getMetadata(EntityField_1.EntityFieldMetadata.ENTITY_FIELD_BEFORE_SET, this, property);
                if (setter) {
                    const newVal = setter.call(this, value, { entity: this });
                    _value = newVal;
                }
                this.update({}, (draft) => {
                    draft[property] = value;
                });
                return true;
            },
            apply: (target, thisArg, argumentsList) => {
                const methodName = target.name;
                const entityType = (0, getEntityTypeName_1.getEntityTypeName)(this);
                const isEntityFunction = Reflect.getMetadata("entityFunction", this, methodName) !== undefined;
                if ("isRPC" in this.manager && isEntityFunction) {
                    const rpc = this.manager;
                    // Executes the method remotely
                    return rpc.executeRemote(entityType, this.id, methodName, argumentsList);
                }
                else if (isEntityFunction) {
                    return this.wrapPersistingUpdates(target.bind(thisArg, ...argumentsList));
                }
                // Executes the method locally
                return target.apply(thisArg, argumentsList);
            },
            // Also need to handle get when returend value is a function
            get: (target, property, receiver) => {
                const value = target[property];
                const isEntityField = this.getEntityFields().includes(property);
                if (isEntityField) {
                    if (getWatchContext()) {
                        // If inside a watch context, track the property for reactivity
                        const { currentWatchers, initialPatches } = getWatchContext();
                        currentWatchers.current.add(property);
                    }
                    const getter = Reflect.getMetadata(EntityField_1.EntityFieldMetadata.ENTITY_FIELD_GETTER, this, property);
                    if (getter) {
                        return getter.call(this, { value: this.draft[property] });
                    }
                    return this.draft[property];
                }
                if (typeof value === "function") {
                    // If the method is a remote method, execute it remotely
                    const isEntityFn = Reflect.getMetadata("entityFunction", this, property) !== undefined;
                    if (isEntityFn) {
                        if ("isRPC" in this.manager) {
                            const man = this.manager;
                            return (...args) => {
                                return man.executeRemote((0, getEntityTypeName_1.getEntityTypeName)(this), this.id, property, args);
                            };
                        }
                        else {
                            return this.wrapPersistingUpdates(value);
                        }
                    }
                }
                // If the property is an entity field
                return this.getEntityFields().includes(property) ? this.draft[property] : value;
            },
        });
        this._proxy = proxy;
        this.onHydrated.call(proxy);
        return proxy;
    }
    wrapPersistingUpdates(fn) {
        return async (...args) => {
            const result = await fn(...args);
            await this.writePendingUpdates();
            return result;
        };
    }
    getUpdates() {
        // This could be more efficient, for now just update whole object
        return this.draft;
    }
    getEntityFields() {
        const properties = (0, remeda_1.uniq)([...Object.getOwnPropertyNames(this), ...Object.getOwnPropertyNames(this.draft)]);
        return properties
            .filter((prop) => {
            return (Reflect.getMetadata("entityField", this, prop) !== undefined ||
                Reflect.getMetadata("entityRelation", this, prop) !== undefined);
        })
            .concat(["createdAt", "updatedAt"]);
    }
    // Add a new property to store the subscribers
    subscribers = new Map();
    // Add a method to subscribe to property changes
    subscribe(property, callback) {
        if (!this.subscribers.has(property)) {
            this.subscribers.set(property, new Set());
        }
        this.subscribers.get(property).add(callback);
    }
    // Add a method to unsubscribe from property changes
    unsubscribe(property, callback) {
        if (this.subscribers.has(property)) {
            this.subscribers.get(property).delete(callback);
        }
    }
    // Add a new property to store the current watchers
    currentWatchers = new Set();
    getEntityFieldValues() {
        const fields = this.getEntityFields();
        const values = {
            id: this.id,
        };
        for (const field of fields) {
            // @ts-ignore
            values[field] = this.draft[field];
        }
        return values;
    }
    async writePendingUpdates() {
        if (this.isDirty) {
            const modifiedFields = this.patches.reduce((acc, patch) => {
                const topLevelPath = patch.path[0];
                if (typeof topLevelPath === "string" && !acc.hasOwnProperty(topLevelPath)) {
                    acc[topLevelPath] = this.draft[topLevelPath];
                }
                return acc;
            }, {});
            if (Object.keys(modifiedFields).length) {
                const className = (0, getEntityTypeName_1.getEntityTypeName)(this);
                console.debug(`Writing updates to ${className}:${this.id}`, modifiedFields);
                await this.manager.update((0, getEntityTypeName_1.getEntityTypeName)(this), this.id, { ...modifiedFields, id: this.id }, this.revisionNumber);
            }
        }
        this.markClean();
    }
    applyWatchUpdate(update, revisionNumber) {
        if (revisionNumber <= this.revisionNumber) {
            return this;
        }
        this.isApplyingWatchUpdates = true;
        console.debug(`Applying watch update to ${(0, getEntityTypeName_1.getEntityTypeName)(this)}:${this.id}`, update, revisionNumber);
        Object.assign(this, update);
        this.revisionNumber = revisionNumber;
        this.isApplyingWatchUpdates = false;
        return this;
    }
    markClean() {
        this.patches = [];
    }
    /**
     * Temp solution for the fact that deep objects are not tracked (I don't think?)
     */
    _editArrField(field, fn) {
        const arr = this[field];
        const decs = Object.getOwnPropertyDescriptor(this, field);
        if (decs.writable) {
            this[field] = [...fn(arr.map((a) => ({ ...a })))];
            return;
        }
        else {
            throw new Error("Cannot edit array field on non-writable property " + field);
        }
    }
    static temp(classs, fields, manager = new MockEntityManager_1.MockEntityManager()) {
        const entity = new classs(manager, Math.random().toString(36).substring(7), fields);
        return entity;
    }
}
exports.default = Entity;
//# sourceMappingURL=Entity.js.map