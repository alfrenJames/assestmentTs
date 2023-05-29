"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getChangedFields(entity1, entity2) {
    const entityFields1 = entity1.getEntityFields();
    const entityFields2 = entity2.getEntityFields();
    const commonEntityFields = entityFields1.filter((field) => entityFields2.includes(field));
    const changedFields = {};
    for (const field of commonEntityFields) {
        if (entity1[field] !== entity2[field]) {
            changedFields[field] = entity2[field];
        }
    }
    return changedFields;
}
exports.default = getChangedFields;
//# sourceMappingURL=getChangedFields.js.map