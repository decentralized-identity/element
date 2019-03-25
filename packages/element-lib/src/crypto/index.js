const secp256k1 = require('secp256k1');

const getCompressedPublicFromPrivate = privateKeyHex => secp256k1.publicKeyCreate(Buffer.from(privateKeyHex, 'hex')).toString('hex');

const getUncompressedPublicKeyFromCompressedPublicKey = compressedPublicKeyHex => secp256k1
  .publicKeyConvert(Buffer.from(compressedPublicKeyHex, 'hex'), false)
  .slice(1)
  .toString('hex');

module.exports = {
  secp256k1: {
    getCompressedPublicFromPrivate,
    getUncompressedPublicKeyFromCompressedPublicKey,
  },
};
