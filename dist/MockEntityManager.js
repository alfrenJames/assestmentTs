export class MockEntityManager {
    create(entityType, entity) {
        throw new Error("Method not implemented.");
    }
    read(entityType, id) {
        throw new Error("Method not implemented.");
    }
    update(entityType, id, updates, revisionNumber) {
        // throw new Error("Method not implemented.");
        return null;
    }
    delete(entityType, id) {
        // throw new Error("Method not implemented.");
        return null;
    }
    find(entityType, query) {
        throw new Error("Method not implemented.");
    }
    watch(entityType, opts) {
        throw new Error("Method not implemented.");
    }
    call(entityType, id, method, args) {
        throw new Error("Method not implemented.");
    }
    id;
}
//# sourceMappingURL=MockEntityManager.js.map