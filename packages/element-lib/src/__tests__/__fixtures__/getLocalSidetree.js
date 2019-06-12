const element = require('../../../index');
const config = require('../../json/config.local.json');

module.exports = async (dbName) => {
  const storage = element.storage.ipfs.configure({
    multiaddr: config.ipfsApiMultiAddr,
  });

  const db = new element.adapters.database.ElementPouchDBAdapter({
    name: `element-pouchdb.${dbName}`,
  });

  const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

  const blockchain = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.mnemonic,
    providerUrl: config.web3ProviderUrl,
    // when not defined, a new contract is created.
    // anchorContractAddress: config.anchorContractAddress,
  });

  await db.deleteDB();

  await blockchain.resolving;
  const sidetree = new element.Sidetree({
    blockchain,
    storage,
    serviceBus,
    db,
  });
  return sidetree;
};
