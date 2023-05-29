"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteEntityManager = void 0;
const BaseEntityManager_1 = __importDefault(require("./BaseEntityManager"));
const UnknownEntity_1 = require("./UnknownEntity");
const getEntityTypeName_1 = require("./getEntityTypeName");
let nextId = 0;
class RemoteEntityManager extends BaseEntityManager_1.default {
    instances = new Map();
    id = (++nextId).toString();
    findEntityClass(entityType) {
        return this.entities.find((e) => (0, getEntityTypeName_1.entityTypesEqual)(entityType, e));
    }
    createEntityInstance(entityType, data) {
        let instance = this.instances.get(data.id);
        if (!this.instances.has(data.id)) {
            const EntityClass = this.findEntityClass(entityType);
            if (!EntityClass) {
                instance = new UnknownEntity_1.UnknownEntity(this, data.id, data);
            }
            else {
                instance = new EntityClass(this, data.id, data);
            }
        }
        else {
            if ('revisionNumber' in data &&
                data.revisionNumber > instance.revisionNumber) {
                const { revisionNumber, ...updates } = data;
                return instance.applyWatchUpdate(updates, revisionNumber);
            }
        }
        // instance.revisionNumber = Math.max(data.revisionNumber ?? instance.revisionNumber, instance.revisionNumber);
        this.instances.set(data.id, instance);
        return instance;
    }
}
exports.RemoteEntityManager = RemoteEntityManager;
//# sourceMappingURL=RemoteEntityManager.js.map