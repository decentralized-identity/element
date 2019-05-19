const _ = require('lodash');
const { applyReducer } = require('fast-json-patch');
const verifyOperationSignature = require('../../func/verifyOperationSignature');
const payloadToHash = require('../../func/payloadToHash');

module.exports = async (state, anchoredOperation) => {
  // console.log("update", anchoredOperation);
  if (state.deleted) {
    console.log('deleted, skipping');
    return state;
  }

  const {
    didUniqueSuffix,
    previousOperationHash,
    patch,
  } = anchoredOperation.decodedOperationPayload;

  const uid = didUniqueSuffix;

  if (!state[uid]) {
    throw new Error('Cannot update a DID that does not exist.');
  }

  const preUpdateDidDoc = state[uid].doc;

  const { kid } = anchoredOperation.decodedOperation.header;

  const signingKey = _.find(preUpdateDidDoc.publicKey, pubKey => pubKey.id === kid);

  if (state[uid].previousOperationHash !== previousOperationHash) {
    throw new Error('previousOperationHash is not correct, update invalid');
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

  const newPreviousOperationHash = payloadToHash(anchoredOperation.decodedOperationPayload);

  return {
    ...state,
    [uid]: {
      ...state[uid],
      doc: updatedDoc,
      previousOperationHash: newPreviousOperationHash,
      txns: [...state[uid].txns, anchoredOperation.transaction],
    },
  };
};
