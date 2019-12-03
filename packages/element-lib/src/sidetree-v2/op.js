const { encodeJson, signEncodedPayload } = require('./func');

const getDidDocumentModel = (primaryPublicKey, recoveryPublicKey) => ({
  '@context': 'https://w3id.org/did/v1',
  publicKey: [
    {
      id: '#primary',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: primaryPublicKey,
    },
    {
      id: '#recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: recoveryPublicKey,
    },
  ],
});

const getCreatePayload = async (didDocumentModel, primaryKey) => {
  const encodedPayload = encodeJson(didDocumentModel);
  const signature = signEncodedPayload(encodedPayload, primaryKey.privateKey);
  const requestBody = {
    header: {
      operation: 'create',
      kid: '#primary',
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
};

const getUpdatePayloadForAddingAKey = async (
  previousOperation,
  kid,
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
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: newPublicKey,
          },
        ],
      },
    ],
  };
  const encodedPayload = encodeJson(payload);
  const signature = signEncodedPayload(encodedPayload, primaryPrivateKey);
  const requestBody = {
    header: {
      operation: 'update',
      kid: 'primary',
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
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
  const encodedPayload = encodeJson(payload);
  const signature = signEncodedPayload(encodedPayload, primaryPrivateKey);
  const requestBody = {
    header: {
      operation: 'update',
      kid: 'primary',
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
};

const getRecoverPayload = async (didUniqueSuffix, newDidDocument, recoveryPrivateKey, kid) => {
  const payload = {
    didUniqueSuffix,
    newDidDocument,
  };
  const encodedPayload = encodeJson(payload);
  const signature = signEncodedPayload(encodedPayload, recoveryPrivateKey);
  const requestBody = {
    header: {
      operation: 'recover',
      kid,
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
};

const getDeletePayload = async (didUniqueSuffix, recoveryPrivateKey, kid) => {
  const encodedPayload = encodeJson({ didUniqueSuffix });
  const signature = signEncodedPayload(encodedPayload, recoveryPrivateKey);
  const requestBody = {
    header: {
      operation: 'delete',
      kid,
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
};

module.exports = {
  getDidDocumentModel,
  getCreatePayload,
  getUpdatePayloadForAddingAKey,
  getUpdatePayloadForRemovingAKey,
  getRecoverPayload,
  getDeletePayload,
};
