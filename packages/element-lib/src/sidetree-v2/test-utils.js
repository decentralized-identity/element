const element = require('../../index');
const { encodeJson, signEncodedPayload } = require('./func');

const getTestSideTree = () => {
  const db = new element.adapters.database.ElementRXDBAdapter({
    name: 'element-test',
  });

  const storage = element.storage.ipfs.configure({
    multiaddr: '/ip4/127.0.0.1/tcp/5001',
  });

  const blockchain = element.blockchain.ethereum.configure({
    mnemonic: 'hazard pride garment scout search divide solution argue wait avoid title cave',
    hdPath: "m/44'/60'/0'/0/0",
    providerUrl: 'http://localhost:8545',
    anchorContractAddress: '0x1DABA81D326Ae274d5b18111440a05cD9581b305',
  });

  return new element.SidetreeV2({ db, storage, blockchain });
};

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
  getTestSideTree,
  getDidDocumentModel,
  getCreatePayload,
  getRecoverPayload,
  getDeletePayload,
};
