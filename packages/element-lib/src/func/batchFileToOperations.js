const base64url = require('base64url');
const crypto = require('crypto');

// unfortunatly we cannot process signatures here.
// so we are forced to forward a large amount of data.
const batchFileToOperations = batchFile => batchFile.operations.map((op) => {
  const decodedOperation = JSON.parse(base64url.decode(op));
  // this was wrong!!!! THE OPERATION HASH IS THE HASH OF THE PAYLOAD
  // TODO: use this typescript package instead...
  // https://github.com/decentralized-identity/sidetree/blob/361d86b5f10eb8174f4fb5f8871a31384da3e569/lib/core/Operation.ts#L184
  const operationHash = base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(decodedOperation.payload))
      .digest(),
  );
  return {
    operationHash,
    decodedOperation,
    decodedOperationPayload: JSON.parse(base64url.decode(decodedOperation.payload)),
  };
});

module.exports = batchFileToOperations;
