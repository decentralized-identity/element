const secp256k1 = require('secp256k1');
const crypto = require('crypto');

module.exports = () => {
  // generate privKey
  let privKey;
  do {
    privKey = crypto.randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privKey));
  const pubKey = secp256k1.publicKeyCreate(privKey);
  return {
    publicKey: pubKey.toString('hex'),
    privateKey: privKey.toString('hex'),
  };
};
