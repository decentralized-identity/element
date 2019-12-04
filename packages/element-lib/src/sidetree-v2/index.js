const { resolve, sync, create } = require('./protocol');
const op = require('./op');

class Sidetree {
  constructor({ db, blockchain, storage }) {
    this.blockchain = blockchain;
    this.storage = storage;
    this.db = db;
    this.resolve = resolve(this);
    this.sync = sync(this);
    this.create = create(this);
    this.op = op;
  }
}

module.exports = Sidetree;
