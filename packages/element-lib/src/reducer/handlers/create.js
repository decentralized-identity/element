const crypto = require('crypto');
const _ = require('lodash');
const base64url = require('base64url');

const config = require('../../json/config.json');

const verifyOperationSignature = require('../../func/verifyOperationSignature');

// Spec Ambiguity....
// https://github.com/decentralized-identity/sidetree-core/issues/112
module.exports = async (state, anchoredOperation) => {
  // console.log("create", anchoredOperation);

  const didDoc = anchoredOperation.decodedOperationPayload;

  const didUniqueSuffix = base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(anchoredOperation.decodedOperation.payload))
      .digest(),
  );

  if (state[didUniqueSuffix]) {
    throw new Error('DID Already Exists.');
  }

  const { kid } = anchoredOperation.decodedOperation.header;

  const signingKey = _.find(didDoc.publicKey, pubKey => pubKey.id === kid);

  if (!signingKey) {
    throw new Error('DID MUST contain the key used to sign its create operation');
  }

  const isSignatureValid = await verifyOperationSignature({
    operation: anchoredOperation.encodedOperation,
    publicKey: signingKey.publicKeyHex,
  });

  if (!isSignatureValid) {
    throw new Error('Signature is not valid.');
  }

  // we're breaking with the spec because
  // operationHash should be a hash of an encodedOperation,
  // not a decodedOperation's encodedPayload.
  const previousOperationHash = base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(anchoredOperation.encodedOperation))
      .digest(),
  );

  return {
    ...state,
    [didUniqueSuffix]: {
      doc: {
        ...anchoredOperation.decodedOperationPayload,
        id: config.didMethodName + didUniqueSuffix,
      },
      operationNumber: 0,
      previousOperationHash,
      txns: [anchoredOperation.transaction],
    },
  };
};
