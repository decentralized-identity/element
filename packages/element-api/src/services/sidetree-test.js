const element = require('@transmute/element-lib');

const db = new element.adapters.database.ElementRXDBAdapter({
  name: 'element-test',
  adapter: 'memory',
});

const storage = element.storage.ipfs.configure({
  multiaddr: '/ip4/127.0.0.1/tcp/5001',
});

const blockchain = element.blockchain.ethereum.configure({
  mnemonic:
    'hazard pride garment scout search divide solution argue wait avoid title cave',
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: 'http://localhost:8545',
  anchorContractAddress: '0x1DABA81D326Ae274d5b18111440a05cD9581b305',
});

const parameters = {
  maxOperationsPerBatch: 5,
  batchingIntervalInSeconds: 1,
  didMethodName: 'did:elem:ropsten',
  logLevel: 'error',
};

const sidetree = new element.Sidetree({
  db,
  storage,
  blockchain,
  parameters,
});

module.exports = sidetree;
