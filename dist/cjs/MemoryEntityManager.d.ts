import { Observable } from 'rxjs';
import { Constructor } from 'type-fest';
import { DbEntityManager } from './DBEntityManager';
import Entity from './Entity';
import { EntityTypable } from './EntityTypable';
import { IEntityManager } from './IEntityManager';
export declare class MemoryEntityManager extends DbEntityManager implements IEntityManager {
    private data;
    constructor(entities: Constructor<Entity>[]);
    private getStore;
    create(entityType: EntityTypable, entity: any): Promise<any>;
    read<T = any>(entityType: EntityTypable<T>, id: string): Promise<T>;
    update(entityType: string, id: string, updates: any, revisionNumber: number): Promise<any>;
    delete(entityType: string, id: string): Promise<any>;
    find(entityType: string, query: any): Promise<any>;
    private matchQuery;
    private matchQueryOperators;
    private subjects;
    watch(entityType: string, opts: {
        id: string;
    }): Observable<any>;
    private notifyWatchers;
}
export default MemoryEntityManager;
//# sourceMappingURL=MemoryEntityManager.d.ts.map