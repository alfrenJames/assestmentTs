import 'reflect-metadata';
export declare function EntityRelation<T>(innerType: T): (target: any, propertyKey: string) => void;
export default EntityRelation;
export declare function getEntityRelation<T>(target: any, propertyKey: string): T;
//# sourceMappingURL=EntityRelation.d.ts.map