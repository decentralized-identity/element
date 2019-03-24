const base64url = require('base64url');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

module.exports = async ({ operation, publicKey }) => {
  const operationObject = JSON.parse(base64url.decode(operation));
  const toBeSigned = `.${operationObject.payload}`;
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeSigned))
    .digest();
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');
  return secp256k1.verify(hash, base64url.toBuffer(operationObject.signature), publicKeyBuffer);
};
