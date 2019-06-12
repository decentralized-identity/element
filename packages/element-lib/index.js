const func = require('./src/func');

const reducer = require('./src/reducer');
const crypto = require('./src/crypto');

const blockchain = require('./src/blockchain');
const storage = require('./src/storage');

const schema = require('./src/schema');
const adapters = require('./src/adapters');

const Sidetree = require('./src/sidetree');

module.exports = {
  func,
  reducer,
  crypto,
  blockchain,
  storage,
  schema,
  adapters,
  Sidetree,
};
