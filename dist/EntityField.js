import { invariant } from 'modules/errors';
export var EntityFieldMetadata;
(function (EntityFieldMetadata) {
    EntityFieldMetadata["ENTITY_FIELD"] = "entityField";
    EntityFieldMetadata["ENTITY_FIELD_GETTER"] = "entityFieldGetter";
    EntityFieldMetadata["ENTITY_FIELD_BEFORE_SET"] = "entityFieldSetter";
    EntityFieldMetadata["STREAMABLE_FIELD"] = "streamableField";
})(EntityFieldMetadata || (EntityFieldMetadata = {}));
function EntityField(options) {
    return function (target, propertyKey) {
        Reflect.defineMetadata(EntityFieldMetadata.ENTITY_FIELD, true, target, propertyKey);
        if (options?.streamable) {
            Reflect.defineMetadata(EntityFieldMetadata.STREAMABLE_FIELD, true, target, propertyKey);
        }
        if (options?.get) {
            // Assert no default value, won't take effect
            invariant(!options.defaultValue, '`get` will override `defaultValue`');
            Reflect.defineMetadata(EntityFieldMetadata.ENTITY_FIELD_GETTER, options.get, target, propertyKey);
        }
        else if (options?.defaultValue) {
            Reflect.defineMetadata(EntityFieldMetadata.ENTITY_FIELD_GETTER, ({ value }) => value ?? options.defaultValue, target, propertyKey);
        }
        if (options?.beforeSet) {
            Reflect.defineMetadata(EntityFieldMetadata.ENTITY_FIELD_BEFORE_SET, options.beforeSet, target, propertyKey);
        }
    };
}
export default EntityField;
//# sourceMappingURL=EntityField.js.map