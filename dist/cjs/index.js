"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsert = exports.entityType = exports.serializableMetadataKey = exports.Serialisable = exports.EntityRelation = exports.EntityFunction = exports.EntityField = exports.Entity = void 0;
var Entity_1 = require("./Entity");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return __importDefault(Entity_1).default; } });
var EntityField_1 = require("./EntityField");
Object.defineProperty(exports, "EntityField", { enumerable: true, get: function () { return __importDefault(EntityField_1).default; } });
var EntityFunction_1 = require("./EntityFunction");
Object.defineProperty(exports, "EntityFunction", { enumerable: true, get: function () { return __importDefault(EntityFunction_1).default; } });
var EntityRelation_1 = require("./EntityRelation");
Object.defineProperty(exports, "EntityRelation", { enumerable: true, get: function () { return __importDefault(EntityRelation_1).default; } });
var Serialisable_1 = require("./Serialisable");
Object.defineProperty(exports, "Serialisable", { enumerable: true, get: function () { return Serialisable_1.Serialisable; } });
Object.defineProperty(exports, "serializableMetadataKey", { enumerable: true, get: function () { return Serialisable_1.serializableMetadataKey; } });
var entityType_1 = require("./entityType");
Object.defineProperty(exports, "entityType", { enumerable: true, get: function () { return entityType_1.entityType; } });
const upsert = (entityManager) => async (entityType, query, data = query) => {
    const [existing] = await entityManager.find(entityType, query);
    if (existing) {
        return entityManager.update(entityType, existing.id, data, (existing.revisionNumber ?? 0) + 1);
    }
    else {
        return entityManager.create(entityType, data);
    }
};
exports.upsert = upsert;
//# sourceMappingURL=index.js.map