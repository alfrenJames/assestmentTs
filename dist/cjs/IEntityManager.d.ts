import { Observable } from 'rxjs';
import { Constructor } from 'type-fest';
export interface IEntityManager {
    create(entityType: any, entity: any): Promise<any>;
    read<T = any>(entityType: Constructor<T> | string, id: any): Promise<T>;
    update(entityType: any, id: any, updates: any, revisionNumber?: number): Promise<any>;
    delete(entityType: any, id: any): Promise<any>;
    find<T = any>(entityType: Constructor<T> | string, query: any): Promise<T[]>;
    watch(entityType: any, opts: {
        id: string;
    }): Observable<any>;
    call(entityType: any, id: any, method: any, args: any): Promise<any>;
    id: string;
}
//# sourceMappingURL=IEntityManager.d.ts.map