import element from '@transmute/element-lib';
import config from '../config';

const storage = element.storage.ipfs.configure({
  multiaddr: config.ELEMENT_IPFS_MULTIADDR,
});

const db = new element.adapters.database.ElementRXDBAdapter({
  name: 'element-rxdb.element-app',
});

const storageManager = new element.adapters.storage.StorageManager(db, storage);
const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

let blockchain;

if (window.web3) {
  blockchain = element.blockchain.ethereum.configure({
    // META MASK
    anchorContractAddress: config.ELEMENT_CONTRACT_ADDRESS,
  });
}

export const initSidetree = async () => {
  if (window.web3) {
    const sidetree = new element.Sidetree({
      blockchain,
      storage: storageManager,
      serviceBus,
      db,
      config: {
        VERBOSITY: 1,
      },
    });
    await blockchain.resolving;
    return sidetree;
  }
  return null;
};
