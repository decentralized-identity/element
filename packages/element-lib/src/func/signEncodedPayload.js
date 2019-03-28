const base64url = require('base64url');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

module.exports = (encodedPayload, privateKeyHex) => {
  const toBeSigned = `.${encodedPayload}`;
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeSigned))
    .digest();
  const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
  const signatureObject = secp256k1.sign(hash, privateKeyBuffer);
  const signature = base64url.encode(signatureObject.signature);
  return signature;
};
