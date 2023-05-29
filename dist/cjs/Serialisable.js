"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializableMetadataKey = exports.Serialisable = void 0;
require("reflect-metadata");
const serializableMetadataKey = Symbol('serializable');
exports.serializableMetadataKey = serializableMetadataKey;
function Serialisable(options = {}) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(serializableMetadataKey, options, target, propertyKey);
    };
}
exports.Serialisable = Serialisable;
//# sourceMappingURL=Serialisable.js.map