import Entity from './Entity';
/**
 * @todo at some point it will be necessary to track the _latest_ changes to each entity
 * since some entities may be updated multiple times before being saved.
 */
declare function saveDirtyEntities(entities: Entity[]): Promise<void>;
export default saveDirtyEntities;
//# sourceMappingURL=saveDirtyEntities.d.ts.map