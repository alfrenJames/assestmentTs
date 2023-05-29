import { Draft, enablePatches, produce, produceWithPatches } from "immer";
import { uniq } from "remeda";

import { Constructor } from "type-fest";
import { EntityConfig } from "./EntityConfig";
import { EntityFieldMetadata } from "./EntityField";
import type { IEntityManager } from "./IEntityManager";
import { MockEntityManager } from "./MockEntityManager";
import type { RPCEntityManager } from "./RPCEntityManager";
import { getEntityTypeName } from "./getEntityTypeName";

enablePatches();

if (typeof window !== "undefined") {
	const w = window as any;
	w.devtoolsFormatters = [
		...(w.devtoolsFormatters ?? []),
		{
			header: function (obj: any) {
				if (obj instanceof Entity) {
					return ["div", {}, getEntityTypeName(obj) + ":" + obj.id];
				}
				return null;
			},
			hasBody: function (obj: any) {
				if (obj instanceof Entity) {
					return true;
				}
				return false;
			},
			body: function (obj: any, config: any) {
				if (obj instanceof Entity) {
					const elements = Object.entries(obj.getEntityFieldValues()).map(function ([key, value]: [string, any]) {
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
						} else {
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

let watchContext: any = null;
export function setWatchContext(ctx: any) {
	watchContext = ctx;
}
export function getWatchContext() {
	return watchContext;
}

export default abstract class Entity<Fields extends Record<string, any> = any> {
	static type = "string";

	static createdIds: string[] = [];

	readonly id: string;
	public revisionNumber: number = 0;
	private readonly config?: EntityConfig;
	isApplyingWatchUpdates = false;

	// If we use EntityField decorator here, for some reason this breaks.
	// So we hardcode them as entity fields by concating their names further down below
	createdAt: Date = new Date();
	updatedAt: Date = new Date();

	draft: Draft<any>;

	patches: any[] = [];

	get isNew() {
		return !this.id;
	}

	get isDirty() {
		return this.patches.length;
	}

	_proxy: any;

	onHydrated() {}

	update(
		_opts:
			| {
					stealth?: boolean;
			  }
			| ((draft: Draft<Fields>) => void),
		_callback?: (draft: Draft<Fields>) => void,
	) {
		const callback = _callback ?? _opts;
		const opts = typeof _opts !== "function" ? _opts : {};
		const withPatches = produceWithPatches(this.draft, (draft: Draft<Entity>) => {
			// @ts-ignore
			callback(draft);
		}) as any;
		const [newDraft, patches] = withPatches;

		if (patches.length > 0) {
			const [newNewDraft, newNewPatches] = produceWithPatches(newDraft, (draft: Draft<Entity>) => {
				// @ts-ignore
				if (!opts.stealth) {
					draft.updatedAt = new Date();
					if (!draft.createdAt) {
						draft.createdAt = new Date();
					}
				}
			}) as any;

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

	updateObject(field: string, value: any) {
		this[field] = { ...this[field], ...value };
	}

	updateArray(field: string, index: number | ((item: any) => boolean), value: any) {
		if (typeof index === "number") {
			this[field] = [...this[field].slice(0, index), value, ...this[field].slice(index + 1)];
		} else {
			const itemIndex = this[field].findIndex(index);
			if (itemIndex !== -1) {
				this[field] = [...this[field].slice(0, itemIndex), value, ...this[field].slice(itemIndex + 1)];
			}
		}
	}

	constructor(public readonly manager: IEntityManager, id?: string, data?: any, config?: EntityConfig) {
		this.id = id;

		// if (Entity.createdIds.includes(id)) {
		//   debugger
		//   console.warn(`Entity with id ${id} already exists`)
		// }
		// Entity.createdIds.push(id)
		const { revisionNumber, ...theData } = data || { revisionNumber: 0 };

		this.draft = produce(theData, () => {});
		this.revisionNumber = revisionNumber || 0;
		this.config = config;

		const proxy = new Proxy(this, {
			set: (target, property, _value) => {
				let value = _value;
				const isTrackableProperty = this.getEntityFields().includes(property as string);
				if (!isTrackableProperty) {
					target[property] = value;
					return true;
				}

				const setter = Reflect.getMetadata(EntityFieldMetadata.ENTITY_FIELD_BEFORE_SET, this, property as string);
				if (setter) {
					const newVal = setter.call(this, value, { entity: this });
					_value = newVal;
				}

				this.update({}, (draft: any) => {
					draft[property] = value;
				});

				return true;
			},

			apply: (target, thisArg, argumentsList) => {
				const methodName = (target as any as Function).name;
				const entityType = getEntityTypeName(this);

				const isEntityFunction = Reflect.getMetadata("entityFunction", this, methodName) !== undefined;

				if ("isRPC" in this.manager && isEntityFunction) {
					const rpc = this.manager as RPCEntityManager;
					// Executes the method remotely
					return rpc.executeRemote(entityType, this.id, methodName, argumentsList);
				} else if (isEntityFunction) {
					return this.wrapPersistingUpdates((target as any as Function).bind(thisArg, ...argumentsList));
				}

				// Executes the method locally
				return (target as any as Function).apply(thisArg, argumentsList);
			},

			// Also need to handle get when returend value is a function
			get: (target, property, receiver) => {
				const value = target[property];

				const isEntityField = this.getEntityFields().includes(property as string);

				if (isEntityField) {
					if (getWatchContext()) {
						// If inside a watch context, track the property for reactivity
						const { currentWatchers, initialPatches } = getWatchContext();
						currentWatchers.current.add(property as string);
					}

					const getter = Reflect.getMetadata(EntityFieldMetadata.ENTITY_FIELD_GETTER, this, property as string);
					if (getter) {
						return getter.call(this, { value: this.draft[property] });
					}

					return this.draft[property];
				}

				if (typeof value === "function") {
					// If the method is a remote method, execute it remotely
					const isEntityFn = Reflect.getMetadata("entityFunction", this, property as string) !== undefined;
					if (isEntityFn) {
						if ("isRPC" in this.manager) {
							const man = this.manager as RPCEntityManager;
							return (...args: any[]) => {
								return man.executeRemote(getEntityTypeName(this), this.id, property as string, args);
							};
						} else {
							return this.wrapPersistingUpdates(value);
						}
					}
				}

				// If the property is an entity field
				return this.getEntityFields().includes(property as string) ? this.draft[property] : value;
			},
		});

		this._proxy = proxy;
		this.onHydrated.call(proxy);
		return proxy;
	}

	wrapPersistingUpdates(fn: (...args: any[]) => Promise<void>) {
		return async (...args: any[]) => {
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
		const properties = uniq([...Object.getOwnPropertyNames(this), ...Object.getOwnPropertyNames(this.draft)]);
		return properties
			.filter((prop) => {
				return (
					Reflect.getMetadata("entityField", this, prop) !== undefined ||
					Reflect.getMetadata("entityRelation", this, prop) !== undefined
				);
			})
			.concat(["createdAt", "updatedAt"]);
	}

	// Add a new property to store the subscribers
	subscribers: Map<string, Set<() => void>> = new Map();

	// Add a method to subscribe to property changes
	subscribe(property: string, callback: () => void) {
		if (!this.subscribers.has(property)) {
			this.subscribers.set(property, new Set());
		}
		this.subscribers.get(property).add(callback);
	}

	// Add a method to unsubscribe from property changes
	unsubscribe(property: string, callback: () => void) {
		if (this.subscribers.has(property)) {
			this.subscribers.get(property).delete(callback);
		}
	}

	// Add a new property to store the current watchers
	currentWatchers: Set<{ watchedProperties: Set<string> }> = new Set();
	getEntityFieldValues() {
		const fields = this.getEntityFields();
		const values = {
			id: this.id,
		};
		for (const field of fields) {
			// @ts-ignore
			values[field] = this.draft[field];
		}
		return values as Fields & { id: string };
	}
	async writePendingUpdates() {
		if (this.isDirty) {
			const modifiedFields = this.patches.reduce((acc: Partial<Fields>, patch) => {
				const topLevelPath = patch.path[0];
				if (typeof topLevelPath === "string" && !acc.hasOwnProperty(topLevelPath)) {
					(acc as any)[topLevelPath] = this.draft[topLevelPath];
				}
				return acc;
			}, {} as Partial<Fields>);

			if (Object.keys(modifiedFields).length) {
				const className = getEntityTypeName(this);
				console.debug(`Writing updates to ${className}:${this.id}`, modifiedFields);
				await this.manager.update(
					getEntityTypeName(this),
					this.id,
					{ ...modifiedFields, id: this.id } as Fields & { id: string },
					this.revisionNumber,
				);
			}
		}
		this.markClean();
	}

	applyWatchUpdate(update: { [key: string]: any }, revisionNumber: number) {
		if (revisionNumber <= this.revisionNumber) {
			return this;
		}
		this.isApplyingWatchUpdates = true;
		console.debug(`Applying watch update to ${getEntityTypeName(this)}:${this.id}`, update, revisionNumber);
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
	_editArrField<T>(field: string, fn: (arr: T[]) => T[]) {
		const arr = this[field] as T[];
		const decs = Object.getOwnPropertyDescriptor(this, field);
		if (decs.writable) {
			this[field as any] = [...fn(arr.map((a) => ({ ...a })))];
			return;
		} else {
			throw new Error("Cannot edit array field on non-writable property " + field);
		}
	}

	static temp(classs: Constructor<Entity>, fields: any, manager: IEntityManager = new MockEntityManager()) {
		const entity = new classs(manager, Math.random().toString(36).substring(7), fields);
		return entity;
	}
}
