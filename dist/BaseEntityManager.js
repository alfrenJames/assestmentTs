import { entityTypesEqual, getEntityTypeName } from "./getEntityTypeName";
import { UnknownEntity } from "./UnknownEntity";
export default class BaseEntityManager {
    entities;
    instances = new Map();
    constructor(entities) {
        this.entities = entities;
    }
    id;
    findEntityClass(typeable) {
        const entityType = getEntityTypeName(typeable);
        return this.entities.find(e => entityTypesEqual(entityType, e));
    }
    createEntityInstance(entityType, data) {
        let instance = this.instances.get(data.id);
        if (!this.instances.has(data.id)) {
            const EntityClass = this.findEntityClass(entityType);
            if (!EntityClass) {
                instance = new UnknownEntity(this, data.id, data);
            }
            instance = new EntityClass(this, data.id, data);
        }
        this.instances.set(data.id, instance);
        return instance;
    }
}
//# sourceMappingURL=BaseEntityManager.js.map