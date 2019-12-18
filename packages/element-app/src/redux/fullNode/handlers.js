import { withHandlers } from 'recompose';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export default withHandlers({
  predictDID: ({ set, getMyDidUniqueSuffix }) => async () => {
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const did = `did:elem:${didUniqueSuffix}`;
    set({
      predictedDID: did,
    });
    let res = await axios.get(`${API_BASE}/sidetree/${did}`);
    set({ myDidDocument: res.data });
    res = await axios.get(`${API_BASE}/sidetree/operations/${didUniqueSuffix}`);
    set({ sidetreeOperations: res.data });
  },
  getOperationsForDidUniqueSuffix: ({ set }) => async (didUniqueSuffix) => {
    set({ loading: true });
    let res = await axios.get(`${API_BASE}/sidetree/did:elem:${didUniqueSuffix}`);
    set({ didDocumentForOperations: res.data });
    res = await axios.get(`${API_BASE}/sidetree/operations/${didUniqueSuffix}`);
    set({ sidetreeOperations: res.data, loading: false });
  },
  createDID: ({
    snackbarMessage, createDIDRequest, getMyDidUniqueSuffix, set,
  }) => async () => {
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    let res;
    set({ resolving: true });

    const createReq = await createDIDRequest();
    await axios.post(`${API_BASE}/sidetree/requests`, createReq);
    snackbarMessage({
      snackbarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
      },
    });
    setTimeout(async () => {
      snackbarMessage({
        snackbarMessage: {
          message: 'Resolving....',
          variant: 'info',
          open: true,
        },
      });
      res = await axios.get(`${API_BASE}/sidetree/did:elem:${didUniqueSuffix}`);
      set({ myDidDocument: res.data });
      snackbarMessage({
        snackbarMessage: {
          message: `Resolved did:elem:${didUniqueSuffix}`,
          variant: 'success',
          open: true,
        },
      });
      set({ resolving: false });
    }, 1.5 * 60 * 1000);
  },
  addKeyToDIDDocument: ({
    snackbarMessage,
    getMyDidUniqueSuffix,
    createAddKeyRequest,
    set,
  }) => async (kid, newPublicKey) => {
    set({ resolving: true });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const res = await axios.get(`${API_BASE}/sidetree/operations/${didUniqueSuffix}`);
    const lastOperation = res.data.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createAddKeyRequest(
      kid,
      newPublicKey,
      didUniqueSuffix,
      operationHash,
    );
    await axios.post(`${API_BASE}/sidetree/requests`, updatePayload);
    snackbarMessage({
      snackbarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
      },
    });
  },
  removeKeyFromDIDDocument: ({
    snackbarMessage,
    getMyDidUniqueSuffix,
    createRemoveKeyRequest,
    set,
  }) => async (kid) => {
    set({ resolving: true });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const res = await axios.get(`${API_BASE}/sidetree/operations/${didUniqueSuffix}`);
    const lastOperation = res.data.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createRemoveKeyRequest(kid, didUniqueSuffix, operationHash);
    await axios.post(`${API_BASE}/sidetree/requests`, updatePayload);
    snackbarMessage({
      snackbarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
      },
    });
  },
  getNodeInfo: ({ snackbarMessage, set }) => async () => {
    set({ resolving: true });
    try {
      const { data } = await axios.get(`${API_BASE}/sidetree/node`);

      set({ nodeInfo: data });
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

  getSidetreeTransactions: ({ set }) => async (args) => {
    set({ loading: true });

    let endpoint = `${API_BASE}/sidetree/transactions`;
    if (args) {
      endpoint += `?since=${args.since}&transactionTimeHash=${args.transactionTimeHash}}`;
    }
    const { data } = await axios.get(endpoint);
    set({ sidetreeTxns: data.reverse(), loading: false });
  },

  getAll: ({ snackbarMessage, set }) => async () => {
    set({ resolving: true });
    try {
      const { data } = await axios.get(`${API_BASE}/sidetree/docs`);
      const getTransactionTime = record => record.record.lastTransaction.transactionTime;
      data.sort((a, b) => getTransactionTime(b) - getTransactionTime(a));
      set({ documentRecords: data });
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
          message: 'Could not resolve DID, make sure it is of the form did:elem:didUniqueSuffix.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },

  getSidetreeOperationsFromTransactionTimeHash: ({ set }) => async (transactionTimeHash) => {
    set({ loading: true });
    // const summary = await sidetree.getTransactionSummary(transactionTimeHash);
    const { data } = await axios.get(
      `${API_BASE}/sidetree/transaction/${transactionTimeHash}/summary`,
    );
    set({ sidetreeTransactionSummary: data, loading: false });
  },
});
