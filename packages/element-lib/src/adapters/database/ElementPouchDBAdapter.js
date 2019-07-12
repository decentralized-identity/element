let PouchDB;

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
