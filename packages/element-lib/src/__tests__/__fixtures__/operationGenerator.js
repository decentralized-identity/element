const element = require('../../../index');

const createDID = (primaryKeypair, recoveryKeypair) => {
  const encodedPayload = element.func.encodeJson({
    '@context': 'https://w3id.org/did/v0.11',
    publicKey: [
      {
        id: '#primary',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: primaryKeypair.publicKey,
      },
      {
        id: '#recovery',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: recoveryKeypair.publicKey,
      },
    ],
  });
  const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
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

const updateRecoveryKey = (didUniqueSuffix, newRecoveryKey, newPrimaryKey, oldRecoveryKey) => {
  const encodedPayload = element.func.encodeJson({
    didUniqueSuffix,
    previousOperationHash: didUniqueSuffix, // should see this twice.
    patch: [
      // first op should update recovery key.
      {
        op: 'replace',
        path: '/publicKey/1',
        value: {
          id: '#recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: newRecoveryKey.publicKey,
        },
      },
      {
        op: 'replace',
        path: '/publicKey/0',
        value: {
          id: '#primary',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: newPrimaryKey.publicKey,
        },
      },
    ],
  });
  const signature = element.func.signEncodedPayload(encodedPayload, oldRecoveryKey.privateKey);
  const requestBody = {
    header: {
      operation: 'recover',
      kid: '#recovery',
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
};

module.exports = {
  createDID,
  updateRecoveryKey,
};
