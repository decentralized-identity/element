const { resolve, sync } = require('./protocol');

class Sidetree {
  constructor({ db, blockchain, storage }) {
    this.blockchain = blockchain;
    this.storage = storage;
    this.db = db;
    this.resolve = resolve(this);
    this.sync = sync(this);
  }
}

module.exports = Sidetree;
