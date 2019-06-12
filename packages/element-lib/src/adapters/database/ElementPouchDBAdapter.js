const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-upsert'));

class ElementPouchDB {
  constructor({ name }) {
    this.dbName = name;
    this.db = new PouchDB(this.dbName);
  }

  write(id, data) {
    return this.db.upsert(id, () => data);
  }

  read(id) {
    return this.db.get(id);
  }

  async readCollection(type) {
    const { docs } = await this.db.find({
      selector: { type },
    });
    return docs;
  }

  deleteDB() {
    return this.db
      .allDocs()
      .then(result => Promise.all(result.rows.map(row => this.db.remove(row.id, row.value.rev))));
  }

  async close() {
    return this.db.close();
  }
}

module.exports = ElementPouchDB;
