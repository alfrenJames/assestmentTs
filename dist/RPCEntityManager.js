import RPCClient from 'modules/rpc-ws/client';
import { getPortForName } from 'modules/transport';
import { Subject, finalize, firstValueFrom, share } from 'rxjs';
import { RemoteEntityManager } from './RemoteEntityManager';
import { getEntityTypeName } from './getEntityTypeName';
let nextId = 0;
export class RPCEntityManager extends RemoteEntityManager {
    entities;
    name;
    client;
    isRPC = true;
    constructor(entities, name) {
        super(entities);
        this.entities = entities;
        this.name = name;
        const port = getPortForName(name);
        this.client = new RPCClient(`ws://localhost:${port}`);
    }
    id = (++nextId).toString();
    obsToPromise(obs) {
        return firstValueFrom(obs);
    }
    call(entityType, id, method, args) {
        // The idea is that calls are executed remotely, so no need for an implementation here
        throw new Error('Method not implemented.');
    }
    async executeRemote(entityType, id, method, args) {
        // You can define how to call the remote method using the RPCClient instance (`this.client`)
        // For example, if the RPCClient has a "call" method:
        const result = await this.obsToPromise(this.client.call({ args: [entityType, id, method, args] }));
        return result;
    }
    async create(entityType, entity) {
        const result = await this.obsToPromise(this.client.create({ args: [getEntityTypeName(entityType), entity] }));
        return this.createEntityInstance(entityType, result);
    }
    async read(entityType, id) {
        const result = await this.obsToPromise(this.client.read({ args: [entityType, id] }));
        return this.createEntityInstance(entityType, result);
    }
    async update(entityType, id, updates, revisionNumber) {
        const result = await this.obsToPromise(this.client.update({ args: [entityType, id, updates, revisionNumber] }));
        return this.createEntityInstance(entityType, result);
    }
    async delete(entityType, id) {
        return this.obsToPromise(this.client.delete({ args: [entityType, id] }));
    }
    async find(entityType, query) {
        const results = await this.obsToPromise(this.client.find({ args: [entityType, query] }));
        return results.map((result) => this.createEntityInstance(entityType, result));
    }
    observablesMap = new Map();
    watch(entityType, options) {
        const { id } = options;
        if (!this.observablesMap.has(id)) {
            const subject = new Subject();
            const observable = this.client
                .watch({ args: [entityType, options] })
                .pipe(finalize(() => {
                subject.unsubscribe();
                this.observablesMap.delete(id);
            }), share());
            this.observablesMap.set(id, observable);
        }
        return this.observablesMap.get(id);
    }
}
//# sourceMappingURL=RPCEntityManager.js.map