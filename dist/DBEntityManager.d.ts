import 'reflect-metadata';
import { Observable } from 'rxjs';
import BaseEntityManager from './BaseEntityManager';
import Entity from './Entity';
import { IEntityManager } from './IEntityManager';
export declare abstract class DbEntityManager extends BaseEntityManager implements IEntityManager {
    instances: Map<string, Entity>;
    abstract create(entityType: any, entity: any): Promise<any>;
    abstract read(entityType: any, id: any): Promise<any>;
    abstract update(entityType: any, id: any, updates: any, revisionNumber: number): Promise<any>;
    abstract delete(entityType: any, id: any): Promise<any>;
    abstract find(entityType: any, query: any): Promise<any>;
    abstract watch(entityType: any, opts: {
        id: string;
    }): Observable<any>;
    call(entityType: any, id: any, method: any, args: any): Promise<any>;
    protected createEntityInstance(entityType: string, data: any): any;
    protected saveOrUpdateRelatedEntities(entity: any, entityType: string): Promise<any>;
    protected applySerializableOptions(entity: any, entityType: string, direction: 'onSave' | 'onLoad'): any;
    populate(entityType: string, entity: any): Promise<any>;
}
//# sourceMappingURL=DBEntityManager.d.ts.map