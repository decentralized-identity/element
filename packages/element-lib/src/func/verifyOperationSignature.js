const base64url = require('base64url');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

module.exports = async ({
  operation, encodedOperationPayload, signature, publicKey,
}) => {
  // TODO: to handle old stuff remove in v2
  let toBeSigned;
  if (encodedOperationPayload) {
    toBeSigned = `.${encodedOperationPayload}`;
  } else {
    const operationObject = JSON.parse(base64url.decode(operation));
    toBeSigned = `.${operationObject.payload}`;
    // eslint-disable-next-line
    signature = operationObject.signature;
  }

  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeSigned))
    .digest();
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');
  return secp256k1.verify(hash, base64url.toBuffer(signature), publicKeyBuffer);
};
