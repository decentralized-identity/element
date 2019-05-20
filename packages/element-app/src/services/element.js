import element from '@transmute/element-lib';
import config from '../config';

export const blockchain = element.blockchain.ethereum.configure({
  anchorContractAddress: config.ELEMENT_CONTRACT_ADDRESS,
});

export const storage = element.storage.ipfs.configure({
  multiaddr: config.ELEMENT_IPFS_MULTIADDR,
});
