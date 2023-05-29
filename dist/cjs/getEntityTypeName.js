"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityTypesEqual = exports.getEntityTypeName = void 0;
const entityType_1 = require("./entityType");
function getEntityTypeName(e) {
    return (0, entityType_1.entityType)(e);
}
exports.getEntityTypeName = getEntityTypeName;
function entityTypesEqual(a, b) {
    return getEntityTypeName(a) === getEntityTypeName(b);
}
exports.entityTypesEqual = entityTypesEqual;
//# sourceMappingURL=getEntityTypeName.js.map