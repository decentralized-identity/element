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
    this.collection = await this.db.collection({
      name: 'todo',
      schema: {
        version: 0,
        type: 'object',
        properties: {
          id: {},
          type: {},
          anchorFileHash: {},
          operationHash: {},
          batchFileHash: {},
        },
      },
    });
  }

  write(id, data) {
    return this.collection
      .upsert({
        _id: id,
        id,
        ...data,
      })
      .then(doc => doc.toJSON());
  }

  async read(id) {
    return this.collection
      .findOne()
      .where('_id')
      .eq(id)
      .exec()
      .then(doc => doc.toJSON());
  }

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
