const func = require('./src/func');
const crypto = require('./src/crypto');
const schema = require('./src/schema');
const adapters = require('./src/adapters');
const Sidetree = require('./src/sidetree');
const MnemonicKeySystem = require('./src/crypto/MnemonicKeySystem');

const { blockchain, storage } = adapters;

module.exports = {
  func,
  crypto,
  blockchain,
  storage,
  schema,
  adapters,
  Sidetree,
  MnemonicKeySystem,
};
