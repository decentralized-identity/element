const resolve = require('./resolve');
const {
  sync,
  syncTransaction,
  mapSync,
  mapSyncTransaction,
} = require('./sync');
const {
  getTransactions,
  getTransactionSummary,
} = require('./utils/transactions');
const getNodeInfo = require('./utils/getNodeInfo');
const OperationQueue = require('./batch/operationQueue');
const BatchScheduler = require('./batch/BatchScheduler');
const batchWrite = require('./batch/batchWrite');
const op = require('./op');
const func = require('../func');
const initLogger = require('./logger');

class Sidetree {
  constructor({ db, blockchain, storage, parameters } = {}) {
    if (!parameters) {
      throw new Error('parameters is missing');
    }
    if (!parameters.didMethodName) {
      throw new Error('didMethodName parameter is missing');
    }
    const operationQueue = new OperationQueue(db);
    // Parameters
    this.parameters = parameters;
    // Utils for sidetree
    this.blockchain = blockchain;
    this.storage = storage;
    this.db = db;
    this.op = op(this);
    this.func = func;
    // Sync
    this.sync = sync(this);
    this.syncTransaction = syncTransaction(this);
    this.mapSync = mapSync(this);
    this.mapSyncTransaction = mapSyncTransaction(this);
    // Resolver
    this.resolve = resolve(this);
    // Batching
    this.operationQueue = operationQueue;
    this.batchWrite = batchWrite(this);
    this.batchScheduler = new BatchScheduler(this);

    this.getTransactions = getTransactions(this);
    this.getTransactionSummary = getTransactionSummary(this);
    this.getNodeInfo = getNodeInfo(this);
    // Logger
    initLogger(this);
  }

  async close() {
    await this.batchScheduler.stopPeriodicBatchWriting();
    await this.blockchain.close();
    await this.storage.close();
    await this.db.close();
  }
}

module.exports = Sidetree;
