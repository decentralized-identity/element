const _ = require('lodash');

const config = require('../../json/config.json');

const payloadToHash = require('../../func/payloadToHash');

const verifyOperationSignature = require('../../func/verifyOperationSignature');

// Spec Ambiguity....
// https://github.com/decentralized-identity/sidetree-core/issues/112
module.exports = async (state, anchoredOperation) => {
  const { transaction, operation } = anchoredOperation;

  const didDoc = operation.decodedOperationPayload;

  const didUniqueSuffix = payloadToHash(operation.decodedOperationPayload);

  if (state[didUniqueSuffix]) {
    throw new Error('DID Already Exists.');
  }

  const { kid } = operation.decodedOperation.header;

  const signingKey = _.find(didDoc.publicKey, pubKey => pubKey.id === kid);

  if (!signingKey) {
    throw new Error('DID MUST contain the key used to sign its create operation');
  }

  const isSignatureValid = await verifyOperationSignature({
    encodedOperationPayload: operation.decodedOperation.payload,
    signature: operation.decodedOperation.signature,
    publicKey: signingKey.publicKeyHex,
  });

  if (!isSignatureValid) {
    throw new Error('Signature is not valid.');
  }

  const previousOperationHash = didUniqueSuffix;

  return {
    ...state,
    [didUniqueSuffix]: {
      doc: {
        ...operation.decodedOperationPayload,
        id: config.didMethodName + didUniqueSuffix,
      },
      previousOperationHash,
      lastTransaction: transaction,
    },
  };
};
