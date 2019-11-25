/* eslint-disable arrow-body-style */
const base64url = require('base64url');
const crypto = require('crypto');

// This function applies f, an async function, sequentially to an array of values
// We need it because:
//   - Promise.all executes all promises at the same time instead of sequentially
//   - for loop with await is very bad apparently
// Adapted from: https://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order
const executeSequentially = (f, array) => {
  return array
    .reduce((promise, value) => {
      return promise.then(() => f(value));
    }, Promise.resolve());
};

const encodeJson = payload => base64url.encode(Buffer.from(JSON.stringify(payload)));

const decodeJson = encodedPayload => JSON.parse(base64url.decode(encodedPayload));

const payloadToHash = (payload) => {
  const encodedPayload = encodeJson(payload);
  return base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(encodedPayload))
      .digest(),
  );
};

const getDidUniqueSuffix = (decodedOperation) => {
  switch (decodedOperation.header.operation) {
    case 'create':
      return payloadToHash(decodedOperation.decodedPayload);
    case 'update':
    case 'recover':
    case 'delete':
      return decodedOperation.decodedPayload.didUniqueSuffix;
    default:
      throw Error(`Cannot extract didUniqueSuffixe from: ${decodedOperation}`);
  }
};

module.exports = {
  executeSequentially,
  encodeJson,
  decodeJson,
  payloadToHash,
  getDidUniqueSuffix,
};
