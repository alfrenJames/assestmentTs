import { FunctionMap } from "modules/rpc-ws/server";
import { IEntityManager } from "./IEntityManager";
export default function createManagerRPCServer(manager: IEntityManager, name: string): {
    close: () => void;
    on: (key: string, func: any) => import("ws").Server<import("ws").WebSocket>;
    functions: FunctionMap;
};
//# sourceMappingURL=wrapRPCManager.d.ts.map