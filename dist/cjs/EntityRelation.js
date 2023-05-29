"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntityRelation = exports.EntityRelation = void 0;
require("reflect-metadata");
function EntityRelation(innerType) {
    return function (target, propertyKey) {
        // const type = Reflect.getMetadata('design:type', target, propertyKey);
        // console.log('entity relation', innerType)
        // console.log(`Property type of ${propertyKey}: ${type.name}`);
        Reflect.defineMetadata('entityRelation', innerType, target, propertyKey);
        // if (type === Array) {
        // const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        // console.log(paramTypes);
        // console.log(`Array inner type: ${paramTypes[0].name}`);
        // }
    };
}
exports.EntityRelation = EntityRelation;
exports.default = EntityRelation;
function getEntityRelation(target, propertyKey) {
    return Reflect.getMetadata('entityRelation', target, propertyKey);
}
exports.getEntityRelation = getEntityRelation;
//# sourceMappingURL=EntityRelation.js.map