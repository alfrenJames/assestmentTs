import { Observable } from 'rxjs';
import { Constructor } from 'type-fest';
import Entity from './Entity';
import { RemoteEntityManager } from './RemoteEntityManager';
export declare class RPCEntityManager extends RemoteEntityManager {
    protected entities: Constructor<Entity>[];
    protected name: string;
    client: any;
    readonly isRPC = true;
    constructor(entities: Constructor<Entity>[], name: string);
    id: string;
    obsToPromise<T>(obs: Observable<T>): Promise<T>;
    call(entityType: string, id: string, method: string, args: any[]): Promise<any>;
    executeRemote(entityType: string, id: string, method: string, args: any[]): Promise<any>;
    create(entityType: string, entity: any): Promise<any>;
    read(entityType: string, id: string): Promise<any>;
    update(entityType: string, id: string, updates: any, revisionNumber: number): Promise<any>;
    delete(entityType: string, id: string): Promise<any>;
    find(entityType: string, query: any): Promise<any>;
    private observablesMap;
    watch(entityType: string, options: {
        id: string;
    }): Observable<any>;
}
//# sourceMappingURL=RPCEntityManager.d.ts.map