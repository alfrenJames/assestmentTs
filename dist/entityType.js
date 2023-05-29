export function entityType(classOrString) {
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
//# sourceMappingURL=entityType.js.map