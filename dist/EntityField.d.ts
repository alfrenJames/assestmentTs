export declare enum EntityFieldMetadata {
    ENTITY_FIELD = "entityField",
    ENTITY_FIELD_GETTER = "entityFieldGetter",
    ENTITY_FIELD_BEFORE_SET = "entityFieldSetter",
    STREAMABLE_FIELD = "streamableField"
}
declare function EntityField<T>(options?: {
    streamable?: boolean;
    get?: () => T;
    beforeSet?: (value: T, opts: {
        entity: any;
    }) => void;
    defaultValue?: T;
}): (target: any, propertyKey: string) => void;
export default EntityField;
//# sourceMappingURL=EntityField.d.ts.map