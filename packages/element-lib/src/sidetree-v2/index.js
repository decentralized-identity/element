const { resolve, sync, batchWrite } = require('./protocol');
const BatchScheduler = require('./protocol/BatchScheduler');
const op = require('./op');
const OperationQueue = require('./operationQueue');

class Sidetree {
  constructor({ db, blockchain, storage }) {
    const operationQueue = new OperationQueue(db);
    this.blockchain = blockchain;
    this.storage = storage;
    this.db = db;
    this.op = op;
    this.resolve = resolve(this);
    this.sync = sync(this);
    // Batching
    this.operationQueue = operationQueue;
    this.batchWrite = batchWrite(this);
    this.batchScheduler = new BatchScheduler(this);
  }
}

module.exports = Sidetree;
