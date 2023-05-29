import { Observable } from "rxjs";
import { IEntityManager } from "./IEntityManager";
export declare class MockEntityManager implements IEntityManager {
    create(entityType: any, entity: any): Promise<any>;
    read(entityType: any, id: any): Promise<any>;
    update(entityType: any, id: any, updates: any, revisionNumber?: number): Promise<any>;
    delete(entityType: any, id: any): Promise<any>;
    find(entityType: any, query: any): Promise<any>;
    watch(entityType: any, opts: {
        id: string;
    }): Observable<any>;
    call(entityType: any, id: any, method: any, args: any): Promise<any>;
    id: string;
}
//# sourceMappingURL=MockEntityManager.d.ts.map