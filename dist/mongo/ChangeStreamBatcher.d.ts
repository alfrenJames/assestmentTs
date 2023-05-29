import { Observable } from 'rxjs';
import { EntityTypable } from '../EntityTypable';
import MongoEntityManager from '../MongoEntityManager';
export declare class ChangeStreamBatcher {
    private readonly mongoEntityManager;
    private changeStreams;
    private subjects;
    private updateQueue;
    private updateTimer;
    constructor(mongoEntityManager: MongoEntityManager);
    getMongoDBChangeStream(type: EntityTypable, options: {
        id: string;
    }): Observable<unknown>;
    private lastUpdateTimestamps;
    private initializeChangeStream;
    private addToUpdateQueue;
    private processUpdateQueue;
}
//# sourceMappingURL=ChangeStreamBatcher.d.ts.map