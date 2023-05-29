import 'reflect-metadata';
const serializableMetadataKey = Symbol('serializable');
export function Serialisable(options = {}) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(serializableMetadataKey, options, target, propertyKey);
    };
}
export { serializableMetadataKey };
//# sourceMappingURL=Serialisable.js.map