const {
  resolve,
  sync,
  batchWrite,
  getTransactions,
} = require('./protocol');
const BatchScheduler = require('./protocol/BatchScheduler');
const op = require('./op');
const func = require('./func');
const OperationQueue = require('./operationQueue');

class Sidetree {
  constructor({
    db,
    blockchain,
    storage,
    parameters,
  }) {
    const operationQueue = new OperationQueue(db);
    // Utils for sidetree
    this.blockchain = blockchain;
    this.storage = storage;
    this.db = db;
    this.op = op;
    this.func = func;
    // Observer
    this.sync = sync(this);
    // Resolver
    this.resolve = resolve(this);
    // Batching
    this.operationQueue = operationQueue;
    this.batchWrite = batchWrite(this);
    this.batchScheduler = new BatchScheduler(this);
    // Parameters
    this.parameters = parameters;

    this.getTransactions = getTransactions(this);
  }
}

module.exports = Sidetree;
