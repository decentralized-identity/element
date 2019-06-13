const moment = require('moment');

const requestBodyToEncodedOperation = require('../func/requestBodyToEncodedOperation');
const operationsToTransaction = require('../func/operationsToTransaction');
const syncFromBlockNumber = require('../func/syncFromBlockNumber');
const reducer = require('../reducer');

class Sidetree {
  constructor({
    serviceBus, db, blockchain, storage, config,
  }) {
    this.blockchain = blockchain;
    this.storage = storage;
    this.serviceBus = serviceBus;
    this.db = db;
    this.config = config || {
      CACHE_EXPIRES_SECONDS: 2,
      VERBOSITY: 0,
    };
    this.registerServiceBusHandlers();
    this.sleep = seconds => new Promise(r => setTimeout(r, seconds * 1000));
  }

  async close() {
    await this.serviceBus.close();
    await this.db.close();
    await this.blockchain.web3.currentProvider.engine.stop();
    await this.sleep(2);
  }

  saveOperationFromRequestBody(requestBody) {
    // TODO: add batching here..
    const encodedOperation = requestBodyToEncodedOperation(requestBody);
    return operationsToTransaction({
      operations: [encodedOperation],
      storage: this.storage,
      blockchain: this.blockchain,
    });
  }

  async getTransactions(fromTransactionTime = 0, toTransactionTime = 'latest') {
    return this.blockchain.getTransactions(fromTransactionTime, toTransactionTime);
  }

  async getOperations() {
    return this.db.readCollection('element:sidetree:operation');
  }

  async resolve(did) {
    const syncArgs = {
      transactionTime: 0,
      initialState: {},
      reducer,
      serviceBus: this.serviceBus,
      blockchain: this.blockchain,
      storage: this.storage,
      db: this.db,
    };

    if (!did) {
      return syncFromBlockNumber(syncArgs);
    }

    const uid = did.split(':').pop();

    const docs = await this.db.read(`element:sidetree:didRecord:${uid}`);

    // did document cache hit
    if (docs.length) {
      const [record] = docs;

      if (!moment().isAfter(record.expires)) {
        return docs[0].doc;
      }
      //  catch expiration
    }
    // did document cache miss / expired
    // check for updates blocking on cache miss.
    const model = await syncFromBlockNumber({
      ...syncArgs,
      didUniqueSuffixes: [uid],
    });

    try {
      await this.db.write(`element:sidetree:didRecord:${uid}`, {
        ...model[uid],
        expires: moment()
          .add(this.config.CACHE_EXPIRES_SECONDS, 'seconds')
          .toISOString(),
      });
    } catch (e) {
      console.warn(e);
    }
    // console.log(model);
    if (model[uid]) {
      return model[uid].doc;
    }
    return null;
  }

  // split up into files.
  registerServiceBusHandlers() {
    this.serviceBus.on('element:sidetree:error', async ({ error, details }) => {
      if (this.config.VERBOSITY > 0) {
        console.warn('Sidetree Error', error);
        console.warn('Details: ', details);
      }
    });

    this.serviceBus.on('element:sidetree:transaction', async ({ transaction }) => {
      try {
        await this.db.write(`element:sidetree:transaction:${transaction.transactionTimeHash}`, {
          type: 'element:sidetree:transaction',
          ...transaction,
        });
      } catch (e) {
        if (e.status === 409) {
          // Document update conflict
          // Meaning we already have this operation.
          // No OP
        } else {
          console.warn(e);
        }
      }
    });

    this.serviceBus.on('element:sidetree:transaction:failing', async ({ transaction }) => {
      try {
        await this.db.write(`element:sidetree:transaction:${transaction.transactionTimeHash}`, {
          // eslint-disable-next-line
          ...transaction,
          failing: true,
        });
      } catch (e) {
        if (e.status === 409) {
          // Document update conflict
          // Meaning we already have this operation.
          // No OP
        } else {
          console.warn(e);
        }
      }
    });

    this.serviceBus.on('element:sidetree:anchorFile', async ({ transaction, anchorFile }) => {
      try {
        await this.db.write(`element:sidetree:anchorFile:${transaction.anchorFileHash}`, {
          type: 'element:sidetree:anchorFile',
          ...anchorFile,
        });
      } catch (e) {
        if (e.status === 409) {
          // Document update conflict
          // Meaning we already have this operation.
          // No OP
        } else {
          console.warn(e);
        }
      }
    });

    this.serviceBus.on(
      'element:sidetree:batchFile',
      async ({ transaction, anchorFile, batchFile }) => {
        try {
          await this.db.write(`element:sidetree:batchFile:${anchorFile.batchFileHash}`, {
            type: 'element:sidetree:batchFile',
            ...batchFile,
          });
        } catch (e) {
          if (e.status === 409) {
            // Document update conflict
            // Meaning we already have this operation.
            // No OP
          } else {
            console.warn(e);
          }
        }
        // migth as well save operations here too
        try {
          await Promise.all(
            batchFile.operations.map(operation => this.db.write(`element:sidetree:operation:${operation.operationHash}`, {
              type: 'element:sidetree:operation',
              transaction,
              ...operation,
            })),
          );
        } catch (e) {
          if (e.status === 409) {
            // Document update conflict
            // Meaning we already have this operation.
            // No OP
          } else {
            console.warn(e);
          }
        }
      },
    );
  }
}

module.exports = Sidetree;
