const _ = require('lodash');
const jsonpatch = require('fast-json-patch');

const { applyReducer } = jsonpatch;
const payloadToHash = require('../../func/payloadToHash');

const verifyOperationSignature = require('../../func/verifyOperationSignature');

module.exports = async (state, anchoredOperation) => {
  // console.log("update", anchoredOperation);
  if (state.deleted) {
    console.log('deleted, skipping');
    return state;
  }

  const opName = 'recover';

  const {
    didUniqueSuffix,
    previousOperationHash,
    patch,
  } = anchoredOperation.decodedOperationPayload;

  const uid = didUniqueSuffix;

  if (!state[uid]) {
    throw new Error(`Cannot ${opName} a DID that does not exist.`);
  }

  const preUpdateDidDoc = state[uid].doc;

  const { kid } = anchoredOperation.decodedOperation.header;

  const signingKey = _.find(preUpdateDidDoc.publicKey, pubKey => pubKey.id === kid);

  if (state[uid].previousOperationHash !== previousOperationHash) {
    throw new Error(`previousOperationHash is not correct, ${opName} invalid`);
  }

  if (!signingKey) {
    throw new Error(`Cannot find kid in doc, ${opName} invalid.`);
  }

  if (signingKey.id !== '#recovery') {
    throw new Error("Recovery ops can only be signed by keys with id '#recovery'");
  }

  //   TODO: this needs to be a better check.
  if (patch[0].value.id !== '#recovery') {
    throw new Error('First patch of recovery must update the recovery key');
  }

  const isSignatureValid = await verifyOperationSignature({
    operation: anchoredOperation.encodedOperation,
    publicKey: signingKey.publicKeyHex,
  });

  if (!isSignatureValid) {
    throw new Error(
      `Signature for ${opName} is not valid. Make sure this op was signed with key id: '#recovery'`,
    );
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
