const registerServiceBusHandlers = require('./serviceBus');
const operationsToTransaction = require('../func/operationsToTransaction');

class Sidetree {
  constructor({
    serviceBus, db, blockchain, storage, config,
  }) {
    this.blockchain = blockchain;
    this.storage = storage;
    this.serviceBus = serviceBus;
    this.db = db;
    this.config = config || {
      BATCH_INTERVAL_SECONDS: 3,
      BAD_STORAGE_HASH_DELAY_SECONDS: 10 * 60, // 10 minutes
      VERBOSITY: 0,
    };
    registerServiceBusHandlers(this);
    require('./getTransactions')(this);
    require('./getAnchorFile')(this);
    require('./getBatchFile')(this);
    require('./getOperations')(this);
    require('./createTransactionFromRequests')(this);
    require('./batchRequests')(this);
    require('./resolve')(this);
    require('./sync')(this);
    require('./getTransactionSummary')(this);
    this.op = require('./op');
    this.sleep = seconds => new Promise(r => setTimeout(r, seconds * 1000));
  }

  async getPreviousOperationHash(didUniqueSuffix) {
    const cachedRecord = await this.db.read(`element:sidetree:did:elem:${didUniqueSuffix}`);
    if (cachedRecord) {
      return cachedRecord.record.previousOperationHash;
    }
    return null;
  }

  async startBatching() {
    this.batchInterval = setInterval(async () => {
      const currentBatch = await this.db.read('element:sidetree:currentBatch');
      if (currentBatch && currentBatch.operations && currentBatch.operations.length) {
        await this.db.write('element:sidetree:currentBatch', {
          operations: [],
        });
        operationsToTransaction({
          operations: currentBatch.operations,
          storage: this.storage,
          blockchain: this.blockchain,
        }).then(() => {
          this.serviceBus.emit('element:sidetree:batchSubmitted', {
            batch: currentBatch,
          });
        });
      }
    }, this.config.BATCH_INTERVAL_SECONDS * 1000);
  }

  async stopBatching() {
    return clearInterval(this.batchInterval);
  }

  async close() {
    await this.stopBatching();
    await this.blockchain.close();
    await this.storage.close();
    await this.serviceBus.close();
    await this.db.close();
  }
}

module.exports = Sidetree;
