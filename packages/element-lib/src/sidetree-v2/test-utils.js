const element = require('../../index');
const { encodeJson, signEncodedPayload } = require('./func');

const getTestSideTree = () => {
  const db = new element.adapters.database.ElementRXDBAdapter({
    name: 'element-test',
  });

  const storage = element.storage.ipfs.configure({
    // multiaddr: '/dns4/ipfs.infura.io/tcp/5001/https',
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

const getCreatePayload = async () => {
  const mnemonic = element.MnemonicKeySystem.generateMnemonic();
  const mks = new element.MnemonicKeySystem(mnemonic);
  const primaryKey = await mks.getKeyForPurpose('primary', 0);
  // TODO: add test without recovery key
  const recoveryKey = await mks.getKeyForPurpose('recovery', 0);
  const encodedPayload = encodeJson({
    '@context': 'https://w3id.org/did/v1',
    publicKey: [
      {
        id: '#primary',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: primaryKey.publicKey,
      },
      {
        id: '#recovery',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: recoveryKey.publicKey,
      },
    ],
  });
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

module.exports = {
  getTestSideTree,
  getCreatePayload,
};
