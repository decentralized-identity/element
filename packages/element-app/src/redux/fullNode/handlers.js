import { withHandlers } from 'recompose';
import axios from 'axios';

import element from '@transmute/element-lib';
// import config from '../../config';
import * as elementService from '../../services/element';

const API_BASE = window.location.hostname === 'element-did.com'
  ? 'https://element-did.com/api/v1'
  : 'http://localhost:5002/element-did/us-central1/main/api/v1';

export default withHandlers({
  getDefaultDID: ({ set }) => async (wallet) => {
    set({ resolving: true });
    const defaultDID = elementService.walletToDID(wallet);
    set({ predictedDefaultDID: defaultDID });
    const { data } = await axios.get(`${API_BASE}/sidetree/${defaultDID}`);
    if (data) {
      set({ defaultDID, resolvedDefaultDID: data });
    } else {
      set({ defaultDID: null, resolvedDefaultDID: null });
    }
    set({ resolving: false });
  },
  createDefaultDID: ({ snackbarMessage, set }) => async (wallet) => {
    set({ resolving: true });

    try {
      const payload = elementService.createDefaultDIDPayload(wallet);

      snackbarMessage({
        snackbarMessage: {
          message: 'Default DID Created... waiting to resolve.',
          variant: 'info',
          open: true,
        },
      });
      const defaultDID = elementService.walletToDID(wallet);
      set({ defaultDID });
      const firstKey = Object.keys(wallet.data.keys)[0];
      const { privateKey } = wallet.data.keys[firstKey];

      const encodedPayload = element.func.encodeJson(payload);
      const signature = element.func.signEncodedPayload(encodedPayload, privateKey);
      const requestBody = {
        header: {
          operation: 'create',
          kid: '#key1',
          alg: 'ES256K',
        },
        payload: encodedPayload,
        signature,
      };
      axios.post(`${API_BASE}/sidetree`, requestBody);
      snackbarMessage({
        snackbarMessage: {
          message: 'Operation Submitted...',
          variant: 'success',
          open: true,
        },
      });

      setTimeout(async () => {
        snackbarMessage({
          snackbarMessage: {
            message: 'Resolving Default DID...',
            variant: 'info',
            open: true,
          },
        });

        const { data } = await axios.get(`${API_BASE}/sidetree/${defaultDID}`);
        set({ resolvedDefaultDID: data, resolving: false });
        snackbarMessage({
          snackbarMessage: {
            message: 'Resolved Default DID.',
            variant: 'success',
            open: true,
          },
        });
      }, 15 * 1000);
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Operation failed.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },

  addKeyToDIDDocument: ({ snackbarMessage, set }) => async (wallet, key) => {
    set({ resolving: true });
    try {
      // await elementService.addKeyToDIDDocument(wallet, key);
      const defaultDID = elementService.walletToDID(wallet);

      const { data } = await axios.get(`${API_BASE}/sidetree/${defaultDID}/record`);
      const record = data;
      const payload = elementService.addKeyPayload(record, key);

      const encodedPayload = element.func.encodeJson(payload);
      const firstKey = Object.keys(wallet.data.keys)[0];
      const { privateKey } = wallet.data.keys[firstKey];
      const signature = element.func.signEncodedPayload(encodedPayload, privateKey);
      const requestBody = {
        header: {
          operation: 'update',
          kid: '#key1',
          alg: 'ES256K',
        },
        payload: encodedPayload,
        signature,
      };
      axios.post(`${API_BASE}/sidetree`, requestBody);
      snackbarMessage({
        snackbarMessage: {
          message: 'Operation Submitted...',
          variant: 'success',
          open: true,
        },
      });
      setTimeout(async () => {
        snackbarMessage({
          snackbarMessage: {
            message: 'Resolving Default DID...',
            variant: 'info',
            open: true,
          },
        });

        const { data } = await axios.get(`${API_BASE}/sidetree/${defaultDID}`);
        set({ resolvedDefaultDID: data, resolving: false });
        snackbarMessage({
          snackbarMessage: {
            message: 'Resolved Default DID.',
            variant: 'success',
            open: true,
          },
        });
      }, 1.5 * 60 * 1000);
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not add key.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },
  removeKeyFromDIDDocument: ({ snackbarMessage, set }) => async (wallet, key) => {
    set({ resolving: true });
    try {
      // await elementService.addKeyToDIDDocument(wallet, key);
      const defaultDID = elementService.walletToDID(wallet);

      const { data } = await axios.get(`${API_BASE}/sidetree/${defaultDID}/record`);
      const record = data;
      const payload = elementService.removeKeyPayload(record, key);

      const encodedPayload = element.func.encodeJson(payload);
      const firstKey = Object.keys(wallet.data.keys)[0];
      const { privateKey } = wallet.data.keys[firstKey];
      const signature = element.func.signEncodedPayload(encodedPayload, privateKey);
      const requestBody = {
        header: {
          operation: 'update',
          kid: '#key1',
          alg: 'ES256K',
        },
        payload: encodedPayload,
        signature,
      };
      axios.post(`${API_BASE}/sidetree`, requestBody);
      snackbarMessage({
        snackbarMessage: {
          message: 'Operation Submitted...',
          variant: 'success',
          open: true,
        },
      });
      setTimeout(async () => {
        snackbarMessage({
          snackbarMessage: {
            message: 'Resolving Default DID...',
            variant: 'info',
            open: true,
          },
        });

        const { data } = await axios.get(`${API_BASE}/sidetree/${defaultDID}`);
        set({ resolvedDefaultDID: data, resolving: false });
        snackbarMessage({
          snackbarMessage: {
            message: 'Resolved Default DID.',
            variant: 'success',
            open: true,
          },
        });
      }, 15 * 1000);
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not add key.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },
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

  getAll: ({ snackbarMessage, set }) => async () => {
    set({ resolving: true });

    try {
      const { data } = await axios.get(`${API_BASE}/sidetree`);

      set({ tree: data });
      snackbarMessage({
        snackbarMessage: {
          message: 'Resolved sidetree.',
          variant: 'success',
          open: true,
        },
      });
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not resolve sidetree.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },

  signAndSubmit: ({ snackbarMessage, set }) => async (type, kid, payload, privateKey) => {
    set({ resolving: true });
    try {
      const encodedPayload = element.func.encodeJson(payload);
      const signature = element.func.signEncodedPayload(encodedPayload, privateKey);
      const requestBody = {
        header: {
          operation: type,
          kid,
          alg: 'ES256K',
          proofOfWork: {},
        },
        payload: encodedPayload,
        signature,
      };
      axios.post(`${API_BASE}/sidetree`, requestBody);
      snackbarMessage({
        snackbarMessage: {
          message: 'Operation Submitted...',
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
