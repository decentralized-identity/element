const resolve = require('./resolve');
const sync = require('./sync');
const { getTransactions, getTransactionSummary } = require('./utils/transactions');
const getNodeInfo = require('./utils/getNodeInfo');
const OperationQueue = require('./batch/operationQueue');
const BatchScheduler = require('./batch/BatchScheduler');
const batchWrite = require('./batch/batchWrite');
const op = require('./op');
const func = require('../func');

class Sidetree {
  constructor({
    db,
    blockchain,
    storage,
    parameters,
  } = {}) {
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
    this.getTransactionSummary = getTransactionSummary(this);
    this.getNodeInfo = getNodeInfo(this);
  }

  async close() {
    await this.batchScheduler.stopPeriodicBatchWriting();
    await this.blockchain.close();
    await this.storage.close();
    await this.db.close();
  }
}

module.exports = Sidetree;
