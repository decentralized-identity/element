/* eslint-disable no-underscore-dangle */
const RxDB = require('rxdb');

class ElementRXDBAdapter {
  constructor({ name, remote }) {
    // RXDB name regex is quite restrictive, therefore we have to replace
    // some special characters like "." and "-" with "_"
    // and put all letters to lowercase
    this.name = name.replace(/\.|-/g, '_').toLowerCase();
    // https://USERNAME:PASSWORD@INSTANCE.cloudantnosqldb.appdomain.cloud/DB/
    this.remote = remote;
    if (process.browser) {
      RxDB.plugin(require('pouchdb-adapter-idb'));
      this.adapter = 'idb';
    } else {
      RxDB.plugin(require('pouchdb-adapter-memory'));
      RxDB.plugin(require('pouchdb-adapter-http'));
      this.adapter = 'memory';
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
          object: {
            type: 'object',
          },
          persisted: {
            type: 'boolean',
          },
          transactionTime: {},
          transactionTimeHash: {},
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

      rxReplicationState.complete$.subscribe((completed) => {
        if (completed) {
          resolve(completed);
        }
      });

      rxReplicationState.error$.subscribe((error) => {
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
