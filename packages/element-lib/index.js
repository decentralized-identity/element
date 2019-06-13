const func = require('./src/func');

const reducer = require('./src/reducer');
const crypto = require('./src/crypto');

const schema = require('./src/schema');
const adapters = require('./src/adapters');

const { blockchain, storage } = adapters;

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
