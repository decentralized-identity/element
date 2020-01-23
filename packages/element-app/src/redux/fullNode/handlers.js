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
  getOperationsForDidUniqueSuffix: ({ set }) => async didUniqueSuffix => {
    set({ loading: true });
    let res = await axios.get(
      `${API_BASE}/sidetree/did:elem:${didUniqueSuffix}`
    );
    set({ didDocumentForOperations: res.data });
    res = await axios.get(`${API_BASE}/sidetree/operations/${didUniqueSuffix}`);
    set({ sidetreeOperations: res.data, loading: false });
  },
  createDID: ({
    doSetTmuiProp,
    createDIDRequest,
    getMyDidUniqueSuffix,
    set,
  }) => async () => {
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    let res;
    set({ resolving: true });

    const createReq = await createDIDRequest();
    axios.post(`${API_BASE}/sidetree/requests`, createReq);
    doSetTmuiProp({
      snackBarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
        vertical: 'bottom',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    setTimeout(async () => {
      doSetTmuiProp({
        snackBarMessage: {
          message: 'Resolving....',
          variant: 'info',
          open: true,
          vertical: 'bottom',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
      res = await axios.get(`${API_BASE}/sidetree/did:elem:${didUniqueSuffix}`);
      set({ myDidDocument: res.data });
      doSetTmuiProp({
        snackBarMessage: {
          message: `Resolved did:elem:${didUniqueSuffix}`,
          variant: 'success',
          open: true,
          vertical: 'bottom',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
      set({ resolving: false });
    }, 1.5 * 60 * 1000);
  },
  addKeyToDIDDocument: ({
    doSetTmuiProp,
    getMyDidUniqueSuffix,
    createAddKeyRequest,
    getDidDocumentKey,
    set,
  }) => async newKey => {
    set({ resolving: true });
    const newPublicKey = getDidDocumentKey(newKey);
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const res = await axios.get(
      `${API_BASE}/sidetree/operations/${didUniqueSuffix}`
    );
    const lastOperation = res.data.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createAddKeyRequest(
      newPublicKey,
      didUniqueSuffix,
      operationHash
    );
    axios.post(`${API_BASE}/sidetree/requests`, updatePayload);
    doSetTmuiProp({
      snackBarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
        vertical: 'bottom',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
  },
  removeKeyFromDIDDocument: ({
    doSetTmuiProp,
    getMyDidUniqueSuffix,
    createRemoveKeyRequest,
    set,
  }) => async kid => {
    set({ resolving: true });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const res = await axios.get(
      `${API_BASE}/sidetree/operations/${didUniqueSuffix}`
    );
    const lastOperation = res.data.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createRemoveKeyRequest(
      kid,
      didUniqueSuffix,
      operationHash
    );
    axios.post(`${API_BASE}/sidetree/requests`, updatePayload);
    doSetTmuiProp({
      snackBarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
        vertical: 'bottom',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
  },
  getNodeInfo: ({ doSetTmuiProp, set }) => async () => {
    set({ resolving: true });
    try {
      const { data } = await axios.get(`${API_BASE}/sidetree/node`);

      set({ nodeInfo: data });
    } catch (e) {
      console.error(e);
      doSetTmuiProp({
        snackBarMessage: {
          message: 'Could not retrieve node info.',
          variant: 'error',
          open: true,
          vertical: 'bottom',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    }
    set({ resolving: false });
  },
  getSidetreeTransactions: ({ set }) => async ({ limit }) => {
    set({ loading: true });
    const { data } = await axios.get(
      `${API_BASE}/sidetree/transactions?limit=${limit}`
    );
    set({ sidetreeTxns: data.reverse(), loading: false });
  },
  getAll: ({ doSetTmuiProp, set }) => async () => {
    set({ resolving: true });
    try {
      const { data } = await axios.get(`${API_BASE}/sidetree/docs`);
      const getTransactionTime = record =>
        record.record.lastTransaction.transactionTime;
      data.sort((a, b) => getTransactionTime(b) - getTransactionTime(a));
      set({ documentRecords: data });
      doSetTmuiProp({
        snackBarMessage: {
          message: 'Resolved sidetree.',
          variant: 'success',
          open: true,
          vertical: 'bottom',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    } catch (e) {
      console.error(e);
      doSetTmuiProp({
        snackBarMessage: {
          message: 'Could not resolve sidetree.',
          variant: 'error',
          open: true,
          vertical: 'bottom',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    }
    set({ resolving: false });
  },
  resolveDID: ({ didResolved, doSetTmuiProp, set }) => async did => {
    set({ resolving: true });
    try {
      const { data } = await axios.get(`${API_BASE}/sidetree/${did}`);
      didResolved({ didDocument: data });
      doSetTmuiProp({
        snackBarMessage: {
          message: `Resolved: ...${data.id}...`,
          variant: 'success',
          open: true,
          vertical: 'bottom',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    } catch (e) {
      console.error(e);
      doSetTmuiProp({
        snackBarMessage: {
          message:
            'Could not resolve DID, make sure it is of the form did:elem:didUniqueSuffix.',
          variant: 'error',
          open: true,
          vertical: 'bottom',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    }
    set({ resolving: false });
  },
  getSidetreeOperationsFromTransactionHash: ({
    set,
  }) => async transactionHash => {
    set({ loading: true });
    const { data } = await axios.get(
      `${API_BASE}/sidetree/transaction/${transactionHash}/summary`
    );
    set({ sidetreeTransactionSummary: data, loading: false });
  },
});
