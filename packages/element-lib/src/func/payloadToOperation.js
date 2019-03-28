const base64url = require('base64url');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

const requestBodyToEncodedOperation = require('./requestBodyToEncodedOperation');

module.exports = async ({
  type, payload, kid, privateKey, proofOfWork,
}) => {
  const encodedPayload = base64url.encode(Buffer.from(JSON.stringify(payload)));
  const toBeSigned = `.${encodedPayload}`;
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeSigned))
    .digest();
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const signatureObject = secp256k1.sign(hash, privateKeyBuffer);
  const signature = base64url.encode(signatureObject.signature);
  return requestBodyToEncodedOperation({
    header: {
      operation: type,
      kid,
      alg: 'ES256K',
      proofOfWork: proofOfWork || {},
    },
    payload: encodedPayload,
    signature,
  });
};
