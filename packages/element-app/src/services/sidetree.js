import element from '@transmute/element-lib';
import config from '../config';

const storage = element.storage.ipfs.configure({
  multiaddr: config.ELEMENT_IPFS_MULTIADDR,
});
const db = new element.adapters.database.ElementPouchDBAdapter({
  name: 'element-pouchdb.element-app',
});
const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();
const blockchain = element.blockchain.ethereum.configure({
  // we use web3 from meta mask here.
  // hdPath: "m/44'/60'/0'/0/0",
  // mnemonic: config.mnemonic,
  // providerUrl: config.web3ProviderUrl,
  // when not defined, a new contract is created.
  anchorContractAddress: config.ELEMENT_CONTRACT_ADDRESS,
});

export const sidetree = new element.Sidetree({
  blockchain,
  storage,
  serviceBus,
  db,
  config: {
    CACHE_EXPIRES_SECONDS: 1 * 60, // 1 minute
    VERBOSITY: 1,
  },
});

export const getSidetree = async () => {
  await blockchain.resolving;
  return sidetree;
};
