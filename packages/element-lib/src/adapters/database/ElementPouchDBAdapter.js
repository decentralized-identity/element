let PouchDB;

// eslint-disable-next-line
if (process.browser) {
  PouchDB = require('pouchdb').default;
  PouchDB.plugin(require('pouchdb-find').default);
  PouchDB.plugin(require('pouchdb-upsert'));
} else {
  PouchDB = require('pouchdb');
  PouchDB.plugin(require('pouchdb-find'));
  PouchDB.plugin(require('pouchdb-upsert'));
}

class ElementPouchDB {
  constructor({ name }) {
    this.dbName = name;
    this.db = new PouchDB(this.dbName);
    try {
      this.db.createIndex({
        index: { fields: ['type', 'anchorFileHash', 'operationHash', 'batchFileHash'] },
      });
    } catch (e) {
      // no update conflict
    }
  }

  async write(id, data) {
    try {
      return await this.db.upsert(id, () => data);
    } catch (e) {
      console.log(e, id, data);
      return null;
    }
  }

  async read(id) {
    try {
      const docs = await this.db.get(id);
      return docs;
    } catch (e) {
      // console.log(e);
      return [];
    }
  }

  // remove
  // async getAnchorFileFromBatchFileHash(batchFileHash) {
  //   const { docs } = await this.db.find({
  //     selector: { batchFileHash, type: 'element:sidetree:anchorFile' },
  //   });
  //   if (docs.length === 0) {
  //     throw new Error(`no anchorFile exists yet for this batchFileHash: ${batchFileHash}`);
  //   }
  //   if (docs.length > 1) {
  //     throw new Error(`more than one anchorFile exists for batchFileHash:${batchFileHash}`);
  //   }
  //   return docs[0];
  // }

  // async getTransactionFromAnchorFileHash(anchorFileHash) {
  //   const { docs } = await this.db.find({
  //     selector: { anchorFileHash, type: 'element:sidetree:transaction' },
  //   });
  //   if (docs.length === 0) {
  //     throw new Error(`no transaction exists yet for this anchorFileHash: ${anchorFileHash}`);
  //   }
  //   if (docs.length > 1) {
  //     throw new Error(`more than one transaction exists for anchorFileHash:${anchorFileHash}`);
  //   }
  //   return docs[0];
  // }

  async readCollection(type) {
    const { docs } = await this.db.find({
      selector: { type },
    });
    return docs;
  }

  async deleteDB() {
    try {
      return await this.db
        .allDocs()
        .then(result => Promise.all(result.rows.map(row => this.db.remove(row.id, row.value.rev))));
    } catch (e) {
      console.log('error: ', e);
      return null;
    }
  }

  async close() {
    return this.db.close();
  }
}

module.exports = ElementPouchDB;
