"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getEntityTypeName_1 = require("./getEntityTypeName");
const UnknownEntity_1 = require("./UnknownEntity");
class BaseEntityManager {
    entities;
    instances = new Map();
    constructor(entities) {
        this.entities = entities;
    }
    id;
    findEntityClass(typeable) {
        const entityType = (0, getEntityTypeName_1.getEntityTypeName)(typeable);
        return this.entities.find(e => (0, getEntityTypeName_1.entityTypesEqual)(entityType, e));
    }
    createEntityInstance(entityType, data) {
        let instance = this.instances.get(data.id);
        if (!this.instances.has(data.id)) {
            const EntityClass = this.findEntityClass(entityType);
            if (!EntityClass) {
                instance = new UnknownEntity_1.UnknownEntity(this, data.id, data);
            }
            instance = new EntityClass(this, data.id, data);
        }
        this.instances.set(data.id, instance);
        return instance;
    }
}
exports.default = BaseEntityManager;
//# sourceMappingURL=BaseEntityManager.js.map