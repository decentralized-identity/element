const { encodeJson, signEncodedPayload } = require('../func');

const getDidDocumentModel = (primaryPublicKey, recoveryPublicKey) => ({
  '@context': 'https://w3id.org/did/v1',
  publicKey: [
    {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: primaryPublicKey,
    },
    {
      id: '#recovery',
      usage: 'recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: recoveryPublicKey,
    },
  ],
});

const makeSignedOperation = (header, payload, privateKey) => {
  const encodedHeader = encodeJson(header);
  const encodedPayload = encodeJson(payload);
  const signature = signEncodedPayload(encodedHeader, encodedPayload, privateKey);
  const operation = {
    protected: encodedHeader,
    payload: encodedPayload,
    signature,
  };
  return operation;
};

const getCreatePayload = async (didDocumentModel, primaryKey) => {
  // Create the encoded protected header.
  const header = {
    operation: 'create',
    kid: '#primary',
    alg: 'ES256K',
  };
  return makeSignedOperation(header, didDocumentModel, primaryKey.privateKey);
};

const getUpdatePayloadForAddingAKey = async (
  previousOperation,
  kid,
  usage,
  newPublicKey,
  primaryPrivateKey,
) => {
  const payload = {
    didUniqueSuffix: previousOperation.didUniqueSuffix,
    previousOperationHash: previousOperation.operation.operationHash,
    patches: [
      {
        action: 'add-public-keys',
        publicKeys: [
          {
            id: kid,
            usage,
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: newPublicKey,
          },
        ],
      },
    ],
  };
  const header = {
    operation: 'update',
    kid: '#primary',
    alg: 'ES256K',
  };
  return makeSignedOperation(header, payload, primaryPrivateKey);
};

const getUpdatePayloadForRemovingAKey = async (
  previousOperation,
  kid,
  primaryPrivateKey,
) => {
  const payload = {
    didUniqueSuffix: previousOperation.didUniqueSuffix,
    previousOperationHash: previousOperation.operation.operationHash,
    patches: [{
      action: 'remove-public-keys',
      publicKeys: [kid],
    }],
  };
  const header = {
    operation: 'update',
    kid: '#primary',
    alg: 'ES256K',
  };
  return makeSignedOperation(header, payload, primaryPrivateKey);
};

const getRecoverPayload = async (didUniqueSuffix, newDidDocument, recoveryPrivateKey) => {
  const payload = {
    didUniqueSuffix,
    newDidDocument,
  };
  const header = {
    operation: 'recover',
    kid: '#recovery',
    alg: 'ES256K',
  };
  return makeSignedOperation(header, payload, recoveryPrivateKey);
};

const getDeletePayload = async (didUniqueSuffix, recoveryPrivateKey) => {
  const header = {
    operation: 'delete',
    kid: '#recovery',
    alg: 'ES256K',
  };
  const payload = { didUniqueSuffix };
  return makeSignedOperation(header, payload, recoveryPrivateKey);
};

module.exports = {
  getDidDocumentModel,
  makeSignedOperation,
  getCreatePayload,
  getUpdatePayloadForAddingAKey,
  getUpdatePayloadForRemovingAKey,
  getRecoverPayload,
  getDeletePayload,
};
