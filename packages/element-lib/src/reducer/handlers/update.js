const crypto = require('crypto');
const _ = require('lodash');
const base64url = require('base64url');
const { applyReducer } = require('fast-json-patch');
const verifyOperationSignature = require('../../func/verifyOperationSignature');

module.exports = async (state, anchoredOperation) => {
  // console.log("update", anchoredOperation);

  const {
    did,
    previousOperationHash,
    patch,
    operationNumber,
  } = anchoredOperation.decodedOperationPayload;

  const uid = did.split(':')[2];

  if (!state[uid]) {
    throw new Error('Cannot update a DID that does not exist.');
  }

  const preUpdateDidDoc = state[uid].doc;

  const { kid } = anchoredOperation.decodedOperation.header;

  const signingKey = _.find(preUpdateDidDoc.publicKey, pubKey => pubKey.id === kid);

  if (state[uid].previousOperationHash !== previousOperationHash) {
    throw new Error('previousOperationHash is not correct, update invalid');
  }

  if (state[uid].operationNumber !== operationNumber - 1) {
    throw new Error('operationNumber is not correct, update invalid');
  }

  if (!signingKey) {
    throw new Error('Cannot find kid in doc, update invalid.');
  }

  const isSignatureValid = await verifyOperationSignature({
    operation: anchoredOperation.encodedOperation,
    publicKey: signingKey.publicKeyHex,
  });

  if (!isSignatureValid) {
    throw new Error('Signature is not valid.');
  }

  const updatedDoc = patch.reduce(applyReducer, preUpdateDidDoc);

  // we're breaking with the spec because
  // operationHash should be a hash of an encodedOperation,
  // not a decodedOperation's encodedPayload.
  const newPreviousOperationHash = base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(anchoredOperation.encodedOperation))
      .digest(),
  );

  return {
    ...state,
    [uid]: {
      ...state[uid],
      doc: updatedDoc,
      previousOperationHash: newPreviousOperationHash,
      operationNumber,
      txns: [...state[uid].txns, anchoredOperation.transaction],
    },
  };
};
