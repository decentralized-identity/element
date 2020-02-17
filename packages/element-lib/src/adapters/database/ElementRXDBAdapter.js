/* eslint-disable no-underscore-dangle */
const RxDB = require('rxdb');

class ElementRXDBAdapter {
  constructor({ name, remote, adapter }) {
    // RXDB name regex is quite restrictive, therefore we have to replace
    // some special characters like "." and "-" with "_"
    // and put all letters to lowercase
    this.name = name.replace(/\.|-/g, '_').toLowerCase();
    // https://USERNAME:PASSWORD@INSTANCE.cloudantnosqldb.appdomain.cloud/DB/
    this.remote = remote;
    switch (adapter) {
      case 'browser':
        // eslint-disable-next-line
        RxDB.plugin(require('pouchdb-adapter-idb'));
        this.adapter = 'idb';
        break;
      case 'leveldown':
        // eslint-disable-next-line
        RxDB.plugin(require('pouchdb-adapter-leveldb')); // leveldown adapters need the leveldb plugin to work
        // eslint-disable-next-line
        this.adapter = require('leveldown');
        break;
      case 'memory':
        // eslint-disable-next-line
        RxDB.plugin(require('pouchdb-adapter-memory'));
        // eslint-disable-next-line
        RxDB.plugin(require('pouchdb-adapter-http'));
        this.adapter = 'memory';
        break;
      default:
    }
  }

  async _createCollection() {
    return this.db.collection({
      name: 'elementcollection',
      schema: {
        version: 0,
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          anchorFileHash: {
            type: 'string',
          },
          operationHash: {
            type: 'string',
          },
          batchFileHash: {
            type: 'string',
          },
          multihash: {
            type: 'string',
          },
          object: {},
          persisted: {
            type: 'boolean',
          },
          transactionTime: {},
          transactionTimeHash: {},
          transactionHash: {},
          transactionNumber: {},
          transactionTimestamp: {},
          consideredUnresolvableUntil: {},
          record: {},
          transaction: {},
          operation: {},
          didUniqueSuffixes: {},
          merkleRoot: {},
          operations: {},
          syncStartDateTime: {},
          syncStopDateTime: {},
          lastTransactionTime: {},
          error: {},
          didUniqueSuffix: {},
          decodedOperation: {},
          decodedOperationPayload: {},
          queue: {},
          blockHash: {},
          sidetreeTransactionsInBlock: {},
          blockHeight: {},
        },
      },
    });
  }

  async _init() {
    // Only create db if it doesnt exist already
    this.db = await RxDB.create({
      name: this.name,
      adapter: this.adapter,
      multiInstance: false,
    });
    this.collection = await this._createCollection();
  }

  async awaitableSync() {
    if (!this.collection) {
      await this._init();
    }
    return new Promise((resolve, reject) => {
      const rxReplicationState = this.collection.sync({
        remote: this.remote,
        waitForLeadership: true,
        direction: {
          // direction (optional) to specify sync-directions
          pull: true, // default=true
          push: true, // default=true
        },
        options: {
          // sync-options (optional) from https://pouchdb.com/api.html#replication
          live: false,
          retry: true,
        },
      });

      rxReplicationState.complete$.subscribe(completed => {
        if (completed) {
          resolve(completed);
        }
      });

      rxReplicationState.error$.subscribe(error => {
        reject(error);
      });
    });
  }

  async write(id, data) {
    if (!this.collection) {
      await this._init();
    }
    const res = this.collection
      .upsert({
        _id: id,
        id,
        ...data,
      })
      .then(doc => doc.toJSON());

    return res;
  }

  async read(id) {
    if (!this.collection) {
      await this._init();
    }
    return this.collection
      .findOne()
      .where('_id')
      .eq(id)
      .exec()
      .then(doc => doc.toJSON())
      .catch(() => null);
  }

  async readCollection(type) {
    if (!this.collection) {
      await this._init();
    }
    return this.collection
      .find()
      .where('type')
      .eq(type)
      .exec()
      .then(arrayOfDocs => arrayOfDocs.map(doc => doc.toJSON()));
  }

  async deleteDB() {
    if (!this.collection) {
      await this._init();
    }
    await this.collection.remove();
    // Recreates an empty collection
    this.collection = await this._createCollection();
  }

  async close() {
    return this;
  }
}

module.exports = ElementRXDBAdapter;
