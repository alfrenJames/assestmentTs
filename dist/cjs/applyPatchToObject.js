"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPatchToObject = void 0;
function applyPatchToObject(obj, path, value) {
    if (path.length === 1) {
        obj[path[0]] = value;
    }
    else {
        if (!obj[path[0]]) {
            obj[path[0]] = {};
        }
        applyPatchToObject(obj[path[0]], path.slice(1), value);
    }
}
exports.applyPatchToObject = applyPatchToObject;
//# sourceMappingURL=applyPatchToObject.js.map