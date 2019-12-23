const func = require('./func');

module.exports = {
  createKeys: require('./createKeys'),
  objectToMultiHash: require('./objectToMultihash'),
  ...func,
};
