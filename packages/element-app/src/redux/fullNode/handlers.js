import { withHandlers } from 'recompose';
import axios from 'axios';

// import element from '@transmute/element-lib';
// import config from '../../config';

const API_BASE = window.location.hostname === 'element-did.com'
  ? 'https://element-did.com/api/v1'
  : 'http://localhost:5002/element-did/us-central1/main/api/v1';

export default withHandlers({
  getNodeInfo: ({ snackbarMessage, set }) => async () => {
    set({ resolving: true });

    try {
      const { data } = await axios.get(`${API_BASE}/sidetree/node`);

      set({ nodeInfo: data });
      snackbarMessage({
        snackbarMessage: {
          message: 'Retrieved node info...',
          variant: 'success',
          open: true,
        },
      });
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not retrieve node info.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },
  resolveDID: ({ didResolved, snackbarMessage, set }) => async (did) => {
    set({ resolving: true });

    try {
      const { data } = await axios.get(`${API_BASE}/sidetree/${did}`);

      didResolved({ didDocument: data });
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
