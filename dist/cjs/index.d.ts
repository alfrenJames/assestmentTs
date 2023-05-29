import Entity from './Entity';
import { IEntityManager } from './IEntityManager';
export { default as Entity } from './Entity';
export { default as EntityField } from './EntityField';
export { default as EntityFunction } from './EntityFunction';
export { default as EntityRelation } from './EntityRelation';
export type { EntityTypable } from './EntityTypable';
export type { IEntityManager } from './IEntityManager';
export { Serialisable, serializableMetadataKey } from './Serialisable';
export { entityType } from './entityType';
export declare const upsert: (entityManager: IEntityManager) => <T extends Entity<any>>(entityType: string, query: any, data?: any) => Promise<T>;
//# sourceMappingURL=index.d.ts.map