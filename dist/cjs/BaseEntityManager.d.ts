import { Constructor } from "type-fest";
import Entity from "./Entity";
import { IEntityManager } from "./IEntityManager";
import { Observable } from "rxjs";
import { EntityTypable } from "./EntityTypable";
export default abstract class BaseEntityManager implements IEntityManager {
    protected entities: Constructor<Entity>[];
    instances: Map<string, Entity>;
    constructor(entities: Constructor<Entity>[]);
    abstract create(entityType: any, entity: any): Promise<any>;
    abstract read(entityType: any, id: any): Promise<any>;
    abstract update(entityType: any, id: any, updates: any, revisionNumber?: number): any;
    abstract delete(entityType: any, id: any): Promise<any>;
    abstract find(entityType: any, query: any): Promise<any>;
    abstract watch(entityType: any, opts: {
        id: string;
    }): Observable<any>;
    abstract call(entityType: any, id: any, method: any, args: any): Promise<any>;
    id: string;
    findEntityClass(typeable: EntityTypable): Constructor<Entity<any>, any[]>;
    protected createEntityInstance(entityType: string, data: any): any;
}
//# sourceMappingURL=BaseEntityManager.d.ts.map