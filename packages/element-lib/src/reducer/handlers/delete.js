const { applyReducer } = require('fast-json-patch');
const verifyOperationSignature = require('../../func/verifyOperationSignature');
const payloadToHash = require('../../func/payloadToHash');

module.exports = async (state, anchoredOperation) => {
  const { transaction, operation } = anchoredOperation;
  if (state.deleted) {
    console.log('deleted, skipping');
    return state;
  }

  const opName = 'delete';

  const { didUniqueSuffix } = operation.decodedOperationPayload;

  const uid = didUniqueSuffix;

  if (!state[uid]) {
    throw new Error(`Cannot ${opName} a DID that does not exist. didUniqueSuffix: ${uid}`);
  }

  const preUpdateDidDoc = state[uid].doc;

  const { kid } = operation.decodedOperation.header;

  const signingKey = preUpdateDidDoc.publicKey.find(pubKey => pubKey.id === kid);

  if (!signingKey) {
    throw new Error(`Cannot find kid in doc, ${opName} invalid.`);
  }

  const isSignatureValid = await verifyOperationSignature({
    encodedOperationPayload: operation.decodedOperation.payload,
    signature: operation.decodedOperation.signature,
    publicKey: signingKey.publicKeyHex,
  });

  if (!isSignatureValid) {
    throw new Error(`Signature for ${opName} is not valid.`);
  }

  const patch = [
    {
      op: 'replace',
      path: '/publicKey',
      value: [],
    },
  ];

  const updatedDoc = patch.reduce(applyReducer, preUpdateDidDoc);

  const newPreviousOperationHash = payloadToHash(operation.decodedOperationPayload);

  return {
    ...state,
    [uid]: {
      ...state[uid],
      doc: updatedDoc,
      previousOperationHash: newPreviousOperationHash,
      deleted: true,
      lastTransaction: transaction,
    },
  };
};
