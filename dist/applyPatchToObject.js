export function applyPatchToObject(obj, path, value) {
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
//# sourceMappingURL=applyPatchToObject.js.map