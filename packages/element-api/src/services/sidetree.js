const element = require("@transmute/element-lib");
const ElementFirestoreAdapter = require("./element-adapter-firestore");
const ElementMemoryAdapter = require("./element-adapter-memory");
const { firestore } = require("./firebase");
const { getBaseConfig } = require("../config");

const config = getBaseConfig();

let db;

if (config.env === "local") {
  // eslint-disable-next-line
  db = new ElementMemoryAdapter();
} else {
  db = new ElementFirestoreAdapter({ firestore });
}

const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

const blockchain = element.blockchain.ethereum.configure({
  mnemonic: config.ethereum.mnemonic,
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: config.ethereum.provider_url,
  anchorContractAddress: config.ethereum.anchor_contract_address
});

const storage = element.storage.ipfs.configure({
  multiaddr: config.ipfs.multiaddr
});

const sidetree = new element.Sidetree({
  blockchain,
  storage,
  serviceBus,
  db,
  config: {
    BATCH_INTERVAL_SECONDS: parseInt(
      config.sidetree.batch_interval_in_seconds,
      10
    ),
    BAD_STORAGE_HASH_DELAY_SECONDS: parseInt(
      config.sidetree.bad_storage_hash_delay_in_seconds,
      10
    ),
    VERBOSITY: parseInt(config.sidetree.verbosity, 10)
  }
});

module.exports = sidetree;

// module.exports = {
//   close: async () => {
//     await blockchain.close();
//     // console.log('killable');
//   },
// };
