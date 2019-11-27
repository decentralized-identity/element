const element = require('@transmute/element-lib');
const { getBaseConfig } = require('../config');

const config = getBaseConfig();

const blockchain = element.blockchain.ethereum.configure({
  mnemonic: config.ethereum.mnemonic,
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: config.ethereum.provider_url,
  anchorContractAddress: config.ethereum.anchor_contract_address,
});

const db = new element.adapters.database.ElementCouchDBAdapter({
  name: 'element',
  remote: config.couchdb_remote,
});

const storage = element.storage.ipfs.configure({
  multiaddr: config.ipfs.multiaddr,
});

const sidetree = new element.SidetreeV2({ db, storage, blockchain });

module.exports = sidetree;
