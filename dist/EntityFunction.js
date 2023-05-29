import 'reflect-metadata';
export function EntityFunction() {
    return function (target, propertyKey) {
        Reflect.defineMetadata('entityFunction', true, target, propertyKey);
    };
}
export default EntityFunction;
//# sourceMappingURL=EntityFunction.js.map