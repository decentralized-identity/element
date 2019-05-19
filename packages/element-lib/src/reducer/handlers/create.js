
const _ = require('lodash');

const config = require('../../json/config.json');

const payloadToHash = require('../../func/payloadToHash');

const verifyOperationSignature = require('../../func/verifyOperationSignature');

// Spec Ambiguity....
// https://github.com/decentralized-identity/sidetree-core/issues/112
module.exports = async (state, anchoredOperation) => {
  // console.log("create", anchoredOperation);

  const didDoc = anchoredOperation.decodedOperationPayload;

  const didUniqueSuffix = payloadToHash(anchoredOperation.decodedOperationPayload);

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


  const previousOperationHash = didUniqueSuffix;

  return {
    ...state,
    [didUniqueSuffix]: {
      doc: {
        ...anchoredOperation.decodedOperationPayload,
        id: config.didMethodName + didUniqueSuffix,
      },
      previousOperationHash,
      txns: [anchoredOperation.transaction],
    },
  };
};
