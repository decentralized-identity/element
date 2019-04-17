import { withHandlers } from 'recompose';

import element from '@transmute/element-lib';
import config from '../../config';

export default withHandlers({
  resolveDID: ({ didResolved, snackbarMessage, set }) => async (did) => {
    set({ resolving: true });
    const anchorContractAddress = localStorage.getItem('anchorContractAddress');
    // console.log(anchorContractAddress);
    const blockchain = element.blockchain.ethereum.configure({
      anchorContractAddress: config.ELEMENT_CONTRACT_ADDRESS || anchorContractAddress,
    });

    const storage = element.storage.ipfs.configure({
      multiaddr: config.ELEMENT_IPFS_MULTIADDR,
    });
    try {
      const doc = await element.func.resolve({
        did,
        cache: element.cache,
        reducer: element.reducer,
        storage,
        blockchain,
      });

      didResolved({ didDocument: doc });
      snackbarMessage({
        snackbarMessage: {
          message: `Resolved: ...${did.substring(32, 64)}...`,
          variant: 'success',
          open: true,
        },
      });
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not resolve DID, make sure it is of the form did:elem:uid.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },
});
