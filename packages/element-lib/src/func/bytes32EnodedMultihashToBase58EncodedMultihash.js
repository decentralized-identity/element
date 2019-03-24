const multihashes = require('multihashes');

module.exports = bytes32EncodedMultihash => multihashes.toB58String(
  multihashes.fromHexString(`1220${bytes32EncodedMultihash.replace('0x', '')}`),
);
