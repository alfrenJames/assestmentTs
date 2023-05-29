import { entityType } from './entityType';
export function getEntityTypeName(e) {
    return entityType(e);
}
export function entityTypesEqual(a, b) {
    return getEntityTypeName(a) === getEntityTypeName(b);
}
//# sourceMappingURL=getEntityTypeName.js.map