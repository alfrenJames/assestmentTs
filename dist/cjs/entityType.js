"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityType = void 0;
function entityType(classOrString) {
    if (typeof classOrString === 'string') {
        return classOrString;
    }
    else {
        // For proxied objects
        if (classOrString.constructor.name !== 'Function') {
            return classOrString.constructor.name;
        }
        if ('prototype' in classOrString) {
            return classOrString.prototype.constructor.name;
        }
        else if ('name' in classOrString) {
            return classOrString.name;
        }
        else {
            throw new Error('Invalid entity type');
        }
    }
}
exports.entityType = entityType;
//# sourceMappingURL=entityType.js.map