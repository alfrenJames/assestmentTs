import { Collection } from 'mongodb';
import 'reflect-metadata';
import { Observable } from 'rxjs';
import { Constructor } from 'type-fest';
import { DbEntityManager } from './DBEntityManager';
import Entity from './Entity';
import { EntityTypable } from './EntityTypable';
import { IEntityManager } from './IEntityManager';
import { ChangeStreamBatcher } from './mongo/ChangeStreamBatcher';
export declare class MongoEntityManager extends DbEntityManager implements IEntityManager {
    private uri;
    private dbName;
    private client;
    private collections;
    batcher: ChangeStreamBatcher;
    constructor(uri: string, dbName: string, entities: Constructor<Entity>[]);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getCollection(entityType: string): Collection;
    private prepareData;
    private restoreData;
    create(type: EntityTypable, entity: any): Promise<any>;
    read(type: EntityTypable, id: string): Promise<any>;
    update(type: EntityTypable, id: string, updates: any, revisionNumber: number): Promise<any>;
    delete(type: EntityTypable, id: string): Promise<any>;
    find(type: EntityTypable, qq: any): Promise<any>;
    watch(type: EntityTypable, opts: {
        id: string;
    }): Observable<any>;
}
export default MongoEntityManager;
//# sourceMappingURL=MongoEntityManager.d.ts.map