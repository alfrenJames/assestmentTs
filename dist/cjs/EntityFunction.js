"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFunction = void 0;
require("reflect-metadata");
function EntityFunction() {
    return function (target, propertyKey) {
        Reflect.defineMetadata('entityFunction', true, target, propertyKey);
    };
}
exports.EntityFunction = EntityFunction;
exports.default = EntityFunction;
//# sourceMappingURL=EntityFunction.js.map