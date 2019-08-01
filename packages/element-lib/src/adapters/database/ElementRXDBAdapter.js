const RxDB = require('rxdb');

let adapter;

if (process.browser) {
  RxDB.plugin(require('pouchdb-adapter-idb'));
  adapter = 'idb';
} else {
  RxDB.plugin(require('pouchdb-adapter-leveldb'));
  adapter = require('memdown');
}

// if (process.browser) {
//   PouchDB = require('pouchdb').default;
//   PouchDB.plugin(require('pouchdb-find').default);
//   PouchDB.plugin(require('pouchdb-upsert'));
// } else {
//   PouchDB = require('pouchdb');
//   PouchDB.plugin(require('pouchdb-find'));
//   PouchDB.plugin(require('pouchdb-upsert'));
// }

class ElementRXDBAdapter {
  constructor({ name }) {
    this.name = name;
    // try {
    //   this.db.createIndex({
    //     index: { fields: ['type', 'anchorFileHash', 'operationHash', 'batchFileHash'] },
    //   });
    // } catch (e) {
    //   console.warn(e);
    // }
  }

  async init() {
    this.db = await RxDB.create({
      name: this.name,
      adapter,
      multiInstance: false,
      // schema: {
      //   version: 1,
      //   title: 'TODO',
      //   type: 'object',
      //   properties: {
      //     type: {
      //     },
      //     anchorFileHash: {
      //     },
      //     operationHash: {
      //     },
      //     batchFileHash: {
      //     },
      //   },
      // },
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
