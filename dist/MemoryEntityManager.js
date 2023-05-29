import { Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DbEntityManager } from './DBEntityManager';
import { getEntityTypeName } from './getEntityTypeName';
export class MemoryEntityManager extends DbEntityManager {
    data = new Map();
    constructor(entities) {
        super(entities);
    }
    getStore(t) {
        const entityType = getEntityTypeName(t);
        if (!this.data.has(entityType)) {
            this.data.set(entityType, new Map());
        }
        return this.data.get(entityType);
    }
    async create(entityType, entity) {
        const id = uuidv4();
        const store = this.getStore(entityType);
        const typeStr = getEntityTypeName(entityType);
        store.set(id, { ...entity, id, revisionNumber: 0 });
        this.notifyWatchers(entityType, id);
        return this.createEntityInstance(typeStr, store.get(id));
    }
    async read(entityType, id) {
        const type = getEntityTypeName(entityType);
        const store = this.getStore(type);
        return this.createEntityInstance(type, store.get(id));
    }
    async update(entityType, id, updates, revisionNumber) {
        const store = this.getStore(entityType);
        const currentData = store.get(id);
        store.set(id, { ...currentData, ...updates, revisionNumber });
        this.notifyWatchers(entityType, id);
        const instance = (await this.read(entityType, id));
        instance.applyWatchUpdate(updates, revisionNumber);
        return instance;
    }
    async delete(entityType, id) {
        const store = this.getStore(entityType);
        const deletedEntity = await this.read(entityType, id);
        store.delete(id);
        this.notifyWatchers(entityType, id);
        return deletedEntity;
    }
    async find(entityType, query) {
        const store = this.getStore(entityType);
        const data = Array.from(store.values()).filter((item) => this.matchQuery(item, query));
        return data.map((item) => this.createEntityInstance(entityType, item));
    }
    matchQuery(item, query) {
        return Object.keys(query).every((key) => {
            const value = item[key];
            const queryValue = query[key];
            if (typeof queryValue === 'object' && !Array.isArray(queryValue)) {
                return this.matchQueryOperators(value, queryValue);
            }
            return value === queryValue;
        });
    }
    matchQueryOperators(value, queryValue) {
        return Object.keys(queryValue).every((operator) => {
            switch (operator) {
                case '$eq':
                    return value === queryValue[operator];
                case '$ne':
                    return value !== queryValue[operator];
                case '$in':
                    return queryValue[operator].includes(value);
                case '$nin':
                    return !queryValue[operator].includes(value);
                case '$gt':
                    return value > queryValue[operator];
                case '$gte':
                    return value >= queryValue[operator];
                case '$lt':
                    return value < queryValue[operator];
                case '$lte':
                    return value <= queryValue[operator];
                default:
                    return false;
            }
        });
    }
    subjects = new Map();
    watch(entityType, opts) {
        if (!this.subjects.has(entityType)) {
            this.subjects.set(entityType, new Map());
        }
        let subjectsMap = this.subjects.get(entityType);
        if (!subjectsMap.has(opts.id)) {
            const subject = new Subject();
            subjectsMap.set(opts.id, subject);
        }
        const subject = subjectsMap.get(opts.id);
        return new Observable((observer) => {
            const subscription = subject.subscribe(observer);
            return () => {
                subscription.unsubscribe();
                if (subject.observers.length === 0) {
                    subjectsMap.delete(opts.id);
                    if (subjectsMap.size === 0) {
                        this.subjects.delete(entityType);
                    }
                }
            };
        });
    }
    notifyWatchers(entityType, id) {
        const typeName = getEntityTypeName(entityType);
        const subjectsMap = this.subjects.get(typeName);
        if (subjectsMap && subjectsMap.has(id)) {
            subjectsMap.get(id).next(this.read(entityType, id));
        }
    }
}
export default MemoryEntityManager;
//# sourceMappingURL=MemoryEntityManager.js.map