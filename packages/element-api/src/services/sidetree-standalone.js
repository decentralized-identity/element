const element = require('@transmute/element-lib');
const { getBaseConfig } = require('../config');

const config = getBaseConfig();

const blockchain = element.blockchain.ethereum.configure({
  mnemonic: config.ethereum.mnemonic,
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: config.ethereum.provider_url,
  anchorContractAddress: config.ethereum.anchor_contract_address,
});

const db = new element.adapters.database.ElementRXDBAdapter({
  name: 'element',
  adapter: 'leveldown',
});

const storage = new element.adapters.storage.StorageManager(
  db,
  element.storage.ipfs.configure({
    multiaddr: config.ipfs.multiaddr,
  }),
  {
    autoPersist: false,
    retryIntervalSeconds: 5,
  }
);

const parameters = {
  maxOperationsPerBatch: 10 * 1000,
  batchingIntervalInSeconds: 10,
  didMethodName: 'did:elem:ropsten',
};

const sidetree = new element.Sidetree({
  db,
  storage,
  blockchain,
  parameters,
});

module.exports = sidetree;
