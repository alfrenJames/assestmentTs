export { default as Entity } from './Entity';
export { default as EntityField } from './EntityField';
export { default as EntityFunction } from './EntityFunction';
export { default as EntityRelation } from './EntityRelation';
export { Serialisable, serializableMetadataKey } from './Serialisable';
export { entityType } from './entityType';
export const upsert = (entityManager) => async (entityType, query, data = query) => {
    const [existing] = await entityManager.find(entityType, query);
    if (existing) {
        return entityManager.update(entityType, existing.id, data, (existing.revisionNumber ?? 0) + 1);
    }
    else {
        return entityManager.create(entityType, data);
    }
};
//# sourceMappingURL=index.js.map