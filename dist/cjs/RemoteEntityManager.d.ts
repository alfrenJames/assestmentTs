import { Observable } from 'rxjs';
import BaseEntityManager from './BaseEntityManager';
import Entity from './Entity';
import { IEntityManager } from './IEntityManager';
export declare abstract class RemoteEntityManager extends BaseEntityManager implements IEntityManager {
    instances: Map<string, Entity>;
    id: string;
    findEntityClass(entityType: string): import("type-fest").Constructor<Entity<any>, any[]>;
    protected createEntityInstance(entityType: string, data: any): any;
    abstract create(entityType: string, entity: any): Promise<any>;
    abstract read(entityType: string, id: string): Promise<any>;
    abstract update(entityType: string, id: string, updates: any, revisionNumber: number): Promise<any>;
    abstract delete(entityType: string, id: string): Promise<any>;
    abstract find(entityType: string, query: any): Promise<any>;
    abstract watch(entityType: string, options: {
        id: string;
    }): Observable<any>;
    abstract call(entityType: string, id: string, method: string, args: any[]): Promise<any>;
}
//# sourceMappingURL=RemoteEntityManager.d.ts.map