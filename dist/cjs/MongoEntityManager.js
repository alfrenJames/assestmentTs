"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoEntityManager = void 0;
const mongodb_1 = require("mongodb");
require("reflect-metadata");
const remeda_1 = require("remeda");
const DBEntityManager_1 = require("./DBEntityManager");
const getEntityTypeName_1 = require("./getEntityTypeName");
const ChangeStreamBatcher_1 = require("./mongo/ChangeStreamBatcher");
class MongoEntityManager extends DBEntityManager_1.DbEntityManager {
    uri;
    dbName;
    client;
    collections = new Map();
    batcher;
    constructor(uri, dbName, entities) {
        super(entities);
        this.uri = uri;
        this.dbName = dbName;
        this.batcher = new ChangeStreamBatcher_1.ChangeStreamBatcher(this);
        this.connect();
    }
    async connect() {
        this.client = new mongodb_1.MongoClient(this.uri, {
            replicaSet: 'rs0',
        });
        await this.client.connect();
        console.log(`Connected to MongoDB at ${this.uri}/${this.dbName} (em ${this.id})`);
    }
    async disconnect() {
        await this.client.close();
    }
    getCollection(entityType) {
        if (!this.collections.has(entityType)) {
            const collection = this.client.db(this.dbName).collection(entityType);
            this.collections.set(entityType, collection);
        }
        return this.collections.get(entityType);
    }
    // Prepare data by mapping id to _id
    prepareData(data) {
        if (data.id) {
            data = { ...data, _id: new mongodb_1.ObjectId(data.id) };
            delete data.id;
        }
        return data;
    }
    // Restore data by mapping _id to id
    restoreData(data) {
        if (data._id) {
            data = { ...data, id: data._id.toString() };
            delete data._id;
        }
        return data;
    }
    async create(type, entity) {
        const entityType = (0, getEntityTypeName_1.getEntityTypeName)(type);
        const preparedData = this.prepareData(this.applySerializableOptions(entity, entityType, 'onSave'));
        const collection = this.getCollection(entityType);
        const result = await collection.insertOne(preparedData);
        const newDoc = await collection.findOne({ _id: result.insertedId });
        return this.createEntityInstance(entityType, this.restoreData(newDoc));
    }
    async read(type, id) {
        const entityType = (0, getEntityTypeName_1.getEntityTypeName)(type);
        const collection = this.getCollection(entityType);
        const data = await collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        const restoredData = this.restoreData(this.applySerializableOptions(data, entityType, 'onLoad'));
        return this.createEntityInstance(entityType, restoredData);
    }
    async update(type, id, updates, revisionNumber) {
        const entityType = (0, getEntityTypeName_1.getEntityTypeName)(type);
        const preparedUpdates = this.prepareData(this.applySerializableOptions(updates, entityType, 'onSave'));
        const collection = this.getCollection(entityType);
        await collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { ...preparedUpdates, revisionNumber } });
        const instance = (await this.read(entityType, id));
        instance.applyWatchUpdate(updates, revisionNumber);
        return instance;
    }
    async delete(type, id) {
        const entityType = (0, getEntityTypeName_1.getEntityTypeName)(type);
        const collection = this.getCollection(entityType);
        const deletedEntity = await this.read(entityType, id);
        await collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return deletedEntity;
    }
    async find(type, qq) {
        const query = (0, remeda_1.clone)(qq);
        if ('_id' in query) {
            // Convert strings to ObjectIds, quick fix
            if ('$in' in query._id) {
                query._id.$in = query._id.$in.map((id) => new mongodb_1.ObjectId(id));
            }
            else {
                if (Array.isArray(query._id)) {
                    query._id = query._id.map((id) => new mongodb_1.ObjectId(id));
                }
                else {
                    query._id = new mongodb_1.ObjectId(query._id);
                }
            }
        }
        const entityType = (0, getEntityTypeName_1.getEntityTypeName)(type);
        const collection = this.getCollection(entityType);
        // Just get the ids
        const ids = await collection
            .find(query, { projection: { _id: 1 } })
            .toArray();
        // Now use read for each
        return Promise.all(ids.map((id) => this.read(entityType, id._id.toString())));
    }
    watch(type, opts) {
        const entityType = (0, getEntityTypeName_1.getEntityTypeName)(type);
        const changeStreamObs = this.batcher.getMongoDBChangeStream(entityType, opts);
        return changeStreamObs;
    }
}
exports.MongoEntityManager = MongoEntityManager;
exports.default = MongoEntityManager;
//# sourceMappingURL=MongoEntityManager.js.map