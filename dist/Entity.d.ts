import { Draft } from "immer";
import { Constructor } from "type-fest";
import { EntityConfig } from "./EntityConfig";
import type { IEntityManager } from "./IEntityManager";
export declare function setWatchContext(ctx: any): void;
export declare function getWatchContext(): any;
export default abstract class Entity<Fields extends Record<string, any> = any> {
    readonly manager: IEntityManager;
    static type: string;
    static createdIds: string[];
    readonly id: string;
    revisionNumber: number;
    private readonly config?;
    isApplyingWatchUpdates: boolean;
    createdAt: Date;
    updatedAt: Date;
    draft: Draft<any>;
    patches: any[];
    get isNew(): boolean;
    get isDirty(): number;
    _proxy: any;
    onHydrated(): void;
    update(_opts: {
        stealth?: boolean;
    } | ((draft: Draft<Fields>) => void), _callback?: (draft: Draft<Fields>) => void): void;
    updateObject(field: string, value: any): void;
    updateArray(field: string, index: number | ((item: any) => boolean), value: any): void;
    constructor(manager: IEntityManager, id?: string, data?: any, config?: EntityConfig);
    wrapPersistingUpdates(fn: (...args: any[]) => Promise<void>): (...args: any[]) => Promise<void>;
    getUpdates(): any;
    getEntityFields(): string[];
    subscribers: Map<string, Set<() => void>>;
    subscribe(property: string, callback: () => void): void;
    unsubscribe(property: string, callback: () => void): void;
    currentWatchers: Set<{
        watchedProperties: Set<string>;
    }>;
    getEntityFieldValues(): Fields & {
        id: string;
    };
    writePendingUpdates(): Promise<void>;
    applyWatchUpdate(update: {
        [key: string]: any;
    }, revisionNumber: number): this;
    markClean(): void;
    /**
     * Temp solution for the fact that deep objects are not tracked (I don't think?)
     */
    _editArrField<T>(field: string, fn: (arr: T[]) => T[]): void;
    static temp(classs: Constructor<Entity>, fields: any, manager?: IEntityManager): Entity<any>;
}
//# sourceMappingURL=Entity.d.ts.map