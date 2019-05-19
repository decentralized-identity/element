import { withHandlers } from 'recompose';

import element from '@transmute/element-lib';
import config from '../../config';

// eslint-disable-next-line
const getItem = id => JSON.parse(localStorage.getItem(id));

const setItem = (id, value) => {
  // eslint-disable-next-line
  localStorage.setItem(id, JSON.stringify(value));
  return value;
};

const cache = {
  getItem,
  setItem,
};

export default withHandlers({
  resolveDID: ({ didResolved, snackbarMessage, set }) => async (did) => {
    set({ resolving: true });

    const blockchain = element.blockchain.ethereum.configure({
      anchorContractAddress: config.ELEMENT_CONTRACT_ADDRESS,
    });

    const storage = element.storage.ipfs.configure({
      multiaddr: config.ELEMENT_IPFS_MULTIADDR,
    });
    try {
      const doc = await element.func.resolve({
        did,
        cache,
        reducer: element.reducer,
        storage,
        blockchain,
      });

      didResolved({ didDocument: doc });
      snackbarMessage({
        snackbarMessage: {
          message: `Resolved ${doc.id}`,
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
