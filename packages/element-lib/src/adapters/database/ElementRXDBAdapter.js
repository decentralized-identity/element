const RxDB = require('rxdb');

class ElementRXDBAdapter {
  constructor({ name }) {
    this.name = name;
    if (process.browser) {
      RxDB.plugin(require('pouchdb-adapter-idb'));
      this.adapter = 'idb';
    } else {
      RxDB.plugin(require('pouchdb-adapter-leveldb'));
      this.adapter = require('memdown');
    }
  }

  async init() {
    this.db = await RxDB.create({
      name: this.name,
      adapter: this.adapter,
      multiInstance: false,
    });
    await this.db.collection({
      name: 'todo',
      schema: {
        version: 0,
        type: 'object',
        properties: {
          type: {},
          anchorFileHash: {},
          operationHash: {},
          batchFileHash: {},
        },
      },
    });
  }

  // async write(id, data) {
  //   try {
  //     return await this.db.upsert(id, () => data);
  //   } catch (e) {
  //     console.warn(e, id, data);
  //     return null;
  //   }
  // }

  // async read(id) {
  //   try {
  //     const docs = await this.db.get(id);
  //     return docs;
  //   } catch (e) {
  //     // console.warn(e, id);
  //     return [];
  //   }
  // }

  // async readCollection(type) {
  //   const { docs } = await this.db.find({
  //     selector: { type },
  //   });
  //   return docs;
  // }

  // async deleteDB() {
  //   try {
  //     return await this.db
  //       .allDocs()
  //       .then(result => Promise.all(result.rows.map(row => this.db.remove(row.id, row.value.rev))));
  //   } catch (e) {
  //     console.warn(e);
  //     return null;
  //   }
  // }

  close() {
    return this;
  }
}

module.exports = ElementRXDBAdapter;
