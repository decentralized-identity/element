const moment = require('moment');

const requestBodyToEncodedOperation = require('../func/requestBodyToEncodedOperation');
const operationsToTransaction = require('../func/operationsToTransaction');
const syncFromBlockNumber = require('../func/syncFromBlockNumber');
const reducer = require('../reducer');

class Sidetree {
  constructor({
    serviceBus, db, blockchain, storage,
  }) {
    this.blockchain = blockchain;
    this.storage = storage;
    this.serviceBus = serviceBus;
    this.db = db;
    this.registerServiceBusHandlers();
    this.CACHE_EXPIRES_SECONDS = 2;
  }

  async close() {
    await this.db.close();
    await this.blockchain.web3.currentProvider.engine.stop();
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

    const { docs } = await this.db.find({
      selector: { _id: `element:sidetree:didRecord:${uid}` },
    });

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
      await this.db.upsert(`element:sidetree:didRecord:${uid}`, (doc) => {
        // eslint-disable-next-line
        doc = {
          ...model[uid],
          expires: moment()
            .add(this.CACHE_EXPIRES_SECONDS, 'seconds')
            .toISOString(),
        };
        return doc;
      });
    } catch (e) {
      console.warn(e);
    }

    return model[uid].doc;
  }

  // split up into files.
  registerServiceBusHandlers() {
    this.serviceBus.on('element:sidetree:transaction', async ({ transaction }) => {
      try {
        await this.db.put({
          _id: `element:sidetree:transaction:${transaction.transactionTimeHash}`,
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
        await this.db.upsert(
          `element:sidetree:transaction:${transaction.transactionTimeHash}`,
          (doc) => {
            // eslint-disable-next-line
            doc.failing = true;
            return doc;
          },
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
    });

    this.serviceBus.on('element:sidetree:anchorFile', async ({ transaction, anchorFile }) => {
      try {
        await this.db.put({
          _id: `element:sidetree:anchorFile:${transaction.anchorFileHash}`,
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
          await this.db.put({
            _id: `element:sidetree:batchFile:${anchorFile.batchFileHash}`,
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
            batchFile.operations.map(operation => this.db.put({
              _id: `element:sidetree:operation:${operation.operationHash}`,
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
