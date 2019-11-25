const {
  resolve,
  sync,
  create,
  getOperations,
} = require('./protocol');

class Sidetree {
  constructor({ db, blockchain, storage }) {
    this.blockchain = blockchain;
    this.storage = storage;
    this.db = db;
    this.resolve = resolve(this);
    this.sync = sync(this);
    this.create = create(this);
    this.getOperations = getOperations(this);
  }
}

module.exports = Sidetree;
