const multihashes = require('multihashes');

module.exports = base58EncodedMultihash => (
  `0x${multihashes.toHexString(multihashes.fromB58String(base58EncodedMultihash)).substring(4)}`
);
