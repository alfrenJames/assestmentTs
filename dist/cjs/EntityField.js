"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFieldMetadata = void 0;
const errors_1 = require("modules/errors");
var EntityFieldMetadata;
(function (EntityFieldMetadata) {
    EntityFieldMetadata["ENTITY_FIELD"] = "entityField";
    EntityFieldMetadata["ENTITY_FIELD_GETTER"] = "entityFieldGetter";
    EntityFieldMetadata["ENTITY_FIELD_BEFORE_SET"] = "entityFieldSetter";
    EntityFieldMetadata["STREAMABLE_FIELD"] = "streamableField";
})(EntityFieldMetadata = exports.EntityFieldMetadata || (exports.EntityFieldMetadata = {}));
function EntityField(options) {
    return function (target, propertyKey) {
        Reflect.defineMetadata(EntityFieldMetadata.ENTITY_FIELD, true, target, propertyKey);
        if (options?.streamable) {
            Reflect.defineMetadata(EntityFieldMetadata.STREAMABLE_FIELD, true, target, propertyKey);
        }
        if (options?.get) {
            // Assert no default value, won't take effect
            (0, errors_1.invariant)(!options.defaultValue, '`get` will override `defaultValue`');
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
exports.default = EntityField;
//# sourceMappingURL=EntityField.js.map