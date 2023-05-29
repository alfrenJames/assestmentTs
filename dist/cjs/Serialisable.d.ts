import 'reflect-metadata';
declare const serializableMetadataKey: unique symbol;
export type SerializableOptions = {
    onSave?: (value: any) => any;
    onLoad?: (value: any) => any;
};
export declare function Serialisable(options?: SerializableOptions): PropertyDecorator;
export { serializableMetadataKey };
//# sourceMappingURL=Serialisable.d.ts.map