"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCEntityManager = void 0;
const client_1 = __importDefault(require("modules/rpc-ws/client"));
const transport_1 = require("modules/transport");
const rxjs_1 = require("rxjs");
const RemoteEntityManager_1 = require("./RemoteEntityManager");
const getEntityTypeName_1 = require("./getEntityTypeName");
let nextId = 0;
class RPCEntityManager extends RemoteEntityManager_1.RemoteEntityManager {
    entities;
    name;
    client;
    isRPC = true;
    constructor(entities, name) {
        super(entities);
        this.entities = entities;
        this.name = name;
        const port = (0, transport_1.getPortForName)(name);
        this.client = new client_1.default(`ws://localhost:${port}`);
    }
    id = (++nextId).toString();
    obsToPromise(obs) {
        return (0, rxjs_1.firstValueFrom)(obs);
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
        const result = await this.obsToPromise(this.client.create({ args: [(0, getEntityTypeName_1.getEntityTypeName)(entityType), entity] }));
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
            const subject = new rxjs_1.Subject();
            const observable = this.client
                .watch({ args: [entityType, options] })
                .pipe((0, rxjs_1.finalize)(() => {
                subject.unsubscribe();
                this.observablesMap.delete(id);
            }), (0, rxjs_1.share)());
            this.observablesMap.set(id, observable);
        }
        return this.observablesMap.get(id);
    }
}
exports.RPCEntityManager = RPCEntityManager;
//# sourceMappingURL=RPCEntityManager.js.map