import BaseEntityManager from './BaseEntityManager';
import { UnknownEntity } from './UnknownEntity';
import { entityTypesEqual } from './getEntityTypeName';
let nextId = 0;
export class RemoteEntityManager extends BaseEntityManager {
    instances = new Map();
    id = (++nextId).toString();
    findEntityClass(entityType) {
        return this.entities.find((e) => entityTypesEqual(entityType, e));
    }
    createEntityInstance(entityType, data) {
        let instance = this.instances.get(data.id);
        if (!this.instances.has(data.id)) {
            const EntityClass = this.findEntityClass(entityType);
            if (!EntityClass) {
                instance = new UnknownEntity(this, data.id, data);
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
//# sourceMappingURL=RemoteEntityManager.js.map