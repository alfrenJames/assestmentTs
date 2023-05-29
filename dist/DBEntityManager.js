import 'reflect-metadata';
import BaseEntityManager from './BaseEntityManager';
import { serializableMetadataKey } from './Serialisable';
import { UnknownEntity } from './UnknownEntity';
export class DbEntityManager extends BaseEntityManager {
    instances = new Map();
    async call(entityType, id, method, args) {
        const entity = await this.read(entityType, id);
        if (!entity) {
            throw new Error(`Entity not found: ${entityType} ${id}`);
        }
        if (!entity[method]) {
            throw new Error(`Method not found: ${method}`);
        }
        return entity[method](...args);
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
        // instance.revisionNumber = Math.max(data.revisionNumber ?? instance.revisionNumber, instance.revisionNumber);
        this.instances.set(data.id, instance);
        return instance;
    }
    async saveOrUpdateRelatedEntities(entity, entityType) {
        const entityClass = this.findEntityClass(entityType);
        if (!entityClass) {
            throw new Error(`Unknown entity type: ${entityType}`);
        }
        const instance = new entityClass();
        const updatedData = { ...entity };
        for (const key of Object.getOwnPropertyNames(instance)) {
            const relatedEntityType = Reflect.getMetadata('relation', instance, key);
            if (relatedEntityType) {
                const relatedEntities = entity[key];
                const relatedEntityIds = [];
                for (const relatedEntity of relatedEntities) {
                    if (relatedEntity.isNew) {
                        const createdEntity = await this.create(relatedEntityType, relatedEntity);
                        relatedEntityIds.push(createdEntity.id);
                    }
                    else if (relatedEntity.isDirty) {
                        await this.update(relatedEntityType, relatedEntity.id, relatedEntity.getUpdates(), relatedEntity.revisionNumber);
                        relatedEntityIds.push(relatedEntity.id);
                    }
                    else {
                        relatedEntityIds.push(relatedEntity.id);
                    }
                }
                updatedData[key] = relatedEntityIds;
            }
        }
        return updatedData;
    }
    applySerializableOptions(entity, entityType, direction) {
        const entityClass = this.findEntityClass(entityType);
        if (!entityClass) {
            throw new Error(`Unknown entity type: ${entityType}`);
        }
        const instance = this.createEntityInstance(entityType, entity);
        const updatedData = { ...entity };
        for (const key of Object.getOwnPropertyNames(instance)) {
            const options = Reflect.getMetadata(serializableMetadataKey, instance, key);
            if (options && options[direction]) {
                updatedData[key] = options[direction](entity[key]);
            }
        }
        return updatedData;
    }
    async populate(entityType, entity) {
        const fieldsWithRelationMetadata = Object.getOwnPropertyNames(entity).map((key) => {
            return {
                field: key,
                metadata: Reflect.getMetadata('entityRelation', entity, key)
            };
        });
        const fields = fieldsWithRelationMetadata.filter((field) => field.metadata);
        const populatedEntity = { ...entity };
        for (const { metadata, field } of fields) {
            const innerType = metadata;
            if (Array.isArray(entity[field])) {
                try {
                    populatedEntity[field] = await Promise.all(entity[field].map((id) => this.read(innerType, id)));
                }
                catch (e) {
                    console.error(e);
                }
            }
            else if (typeof entity[field] === 'string') {
                try {
                    populatedEntity[field] = await this.read(innerType, entity[field]);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        return populatedEntity;
    }
}
//# sourceMappingURL=DBEntityManager.js.map