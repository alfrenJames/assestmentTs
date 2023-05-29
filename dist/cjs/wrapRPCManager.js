"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("modules/rpc-ws/central/client");
const server_1 = __importDefault(require("modules/rpc-ws/server"));
const index_1 = require("modules/transport/index");
// import asyncLocalStorage from './asyncLocalStorage';
const rxjs_1 = require("rxjs");
const Entity_1 = __importDefault(require("./Entity"));
const getEntityTypeName_1 = require("./getEntityTypeName");
const serialiseResult = (value) => {
    if (value instanceof Entity_1.default) {
        return {
            ...value.getEntityFieldValues(),
            revisionNumber: value.revisionNumber,
            type: (0, getEntityTypeName_1.getEntityTypeName)(value)
        };
    }
    else if (value instanceof rxjs_1.Observable) {
        // make sure we pipe serialised results
        return value.pipe((0, rxjs_1.map)(serialiseResult));
    }
    else {
        return value;
    }
};
function createManagerRPCServer(manager, name) {
    const port = (0, index_1.getPortForName)(name);
    console.log(`Starting RPC server for ${name} on port ${port}`);
    let fns = {};
    for (const key of [
        "create",
        "find",
        "read",
        "update",
        "delete",
        "watch",
        "call"
    ]) {
        const fn = manager[key];
        if (typeof fn === "function") {
            console.log(`Adding ${key} to RPC server`);
            fns[key] = async (payload) => {
                return new Promise(async (resolve, reject) => {
                    // asyncLocalStorage.run(new Map(), async () => {
                    // const store = asyncLocalStorage.getStore()
                    // Set any required store values here
                    try {
                        const result = await fn.call(manager, ...payload.args);
                        // debugger
                        // TODO Now we need to serialise result
                        // console.log({ result })
                        if (Array.isArray(result)) {
                            const res = result.map(serialiseResult);
                            return resolve(res);
                        }
                        const res = serialiseResult(result);
                        return resolve(res);
                    }
                    catch (e) {
                        console.error(e);
                        reject(e);
                    }
                    // });
                    // });
                });
            };
        }
    }
    const server = (0, server_1.default)(port, {
        functions: fns
    });
    client_1.pubSub.provideValue("entityManagersChannel", name);
    return server;
}
exports.default = createManagerRPCServer;
//# sourceMappingURL=wrapRPCManager.js.map