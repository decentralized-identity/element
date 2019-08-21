const func = require('../func');

const create = ({ primaryKey, recoveryPublicKey }) => {
  const encodedPayload = func.encodeJson({
    '@context': 'https://w3id.org/did/v0.11',
    publicKey: [
      {
        id: '#primary',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: primaryKey.publicKey,
      },
      {
        id: '#recovery',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: recoveryPublicKey,
      },
    ],
  });
  const signature = func.signEncodedPayload(encodedPayload, primaryKey.privateKey);
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

const update = ({
  didUniqueSuffix, previousOperationHash, patch, primaryPrivateKey,
}) => {
  const encodedPayload = func.encodeJson({
    didUniqueSuffix,
    previousOperationHash, // should see this twice.
    patch,
  });
  const signature = func.signEncodedPayload(encodedPayload, primaryPrivateKey);
  const requestBody = {
    header: {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
};

const recover = ({
  didUniqueSuffix,
  previousOperationHash,
  newRecoveryPublicKey,
  newPrimaryPublicKey,
  recoveryPrivateKey,
}) => {
  const encodedPayload = func.encodeJson({
    didUniqueSuffix,
    previousOperationHash, // should see this twice.
    patch: [
      // first op should update recovery key.
      {
        op: 'replace',
        path: '/publicKey/1',
        value: {
          id: '#recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: newRecoveryPublicKey,
        },
      },
      {
        op: 'replace',
        path: '/publicKey/0',
        value: {
          id: '#primary',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: newPrimaryPublicKey,
        },
      },
    ],
  });
  const signature = func.signEncodedPayload(encodedPayload, recoveryPrivateKey);
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

const deactivate = ({ didUniqueSuffix, recoveryPrivateKey }) => {
  const encodedPayload = func.encodeJson({
    didUniqueSuffix,
  });
  const signature = func.signEncodedPayload(encodedPayload, recoveryPrivateKey);
  const requestBody = {
    header: {
      operation: 'delete',
      kid: '#recovery',
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  return requestBody;
};

const getDidUniqueSuffix = ({ primaryKey, recoveryPublicKey }) => func.payloadToHash({
  '@context': 'https://w3id.org/did/v0.11',
  publicKey: [
    {
      id: '#primary',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: primaryKey.publicKey,
    },
    {
      id: '#recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: recoveryPublicKey,
    },
  ],
});

module.exports = {
  create,
  recover,
  update,
  deactivate,
  getDidUniqueSuffix,
};
