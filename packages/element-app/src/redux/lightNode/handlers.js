import { withHandlers } from 'recompose';

export default withHandlers({
  predictDID: ({ set, sidetree, getMyDidUniqueSuffix }) => async () => {
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    set({
      predictedDID: `did:elem:${didUniqueSuffix}`,
    });
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    set({ sidetreeOperations: operations });
  },
  getOperationsForDidUniqueSuffix: ({ sidetree, set }) => async (didUniqueSuffix) => {
    set({ loading: true });
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ didDocumentForOperations: myDidDocument });
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    set({ sidetreeOperations: operations, loading: false });
  },
  createDID: ({
    snackbarMessage,
    sidetree,
    createDIDRequest,
    getMyDidUniqueSuffix,
    set,
  }) => async () => {
    set({ resolving: true });
    snackbarMessage({
      snackbarMessage: {
        message: 'Creating your DID will take a few minutes....',
        variant: 'info',
        open: true,
      },
    });
    const createReq = await createDIDRequest();
    await sidetree.batchScheduler.writeNow(createReq);
    snackbarMessage({
      snackbarMessage: {
        message: 'DID Created. Resolving....',
        variant: 'info',
        open: true,
      },
    });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    snackbarMessage({
      snackbarMessage: {
        message: `Resolved did:elem:${didUniqueSuffix}`,
        variant: 'success',
        open: true,
      },
    });
    set({ resolving: false });
  },
  setupEDV: ({
    snackbarMessage,
    getMyDidUniqueSuffix,
    getDidDocumentKey,
    getEdvUpdatePayload,
    set,
    sidetree,
  }) => async (edvKey) => {
    set({ resolving: true });
    const edvDidDocKey = getDidDocumentKey(edvKey);
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    const lastOperation = operations.pop();
    const updatePayload = await getEdvUpdatePayload(didUniqueSuffix, edvDidDocKey, lastOperation);
    snackbarMessage({
      snackbarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
      },
    });
    await sidetree.batchScheduler.writeNow(updatePayload);
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    snackbarMessage({
      snackbarMessage: {
        message: 'EDV properties added',
        variant: 'success',
        open: true,
      },
    });
    set({ resolving: false });
  },
  addKeyToDIDDocument: ({
    snackbarMessage,
    getMyDidUniqueSuffix,
    createAddKeyRequest,
    getDidDocumentKey,
    set,
    sidetree,
  }) => async (newKey) => {
    set({ resolving: true });
    const newPublicKey = getDidDocumentKey(newKey);
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    const lastOperation = operations.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createAddKeyRequest(
      newPublicKey,
      didUniqueSuffix,
      operationHash,
    );
    snackbarMessage({
      snackbarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
      },
    });
    await sidetree.batchScheduler.writeNow(updatePayload);
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    snackbarMessage({
      snackbarMessage: {
        message: 'Key added.',
        variant: 'success',
        open: true,
      },
    });
    set({ resolving: false });
  },
  removeKeyFromDIDDocument: ({
    snackbarMessage,
    getMyDidUniqueSuffix,
    createRemoveKeyRequest,
    set,
    sidetree,
  }) => async (kid) => {
    set({ resolving: true });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    const lastOperation = operations.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createRemoveKeyRequest(kid, didUniqueSuffix, operationHash);
    snackbarMessage({
      snackbarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
      },
    });
    await sidetree.batchScheduler.writeNow(updatePayload);
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    snackbarMessage({
      snackbarMessage: {
        message: 'Key removed.',
        variant: 'success',
        open: true,
      },
    });
    set({ resolving: false });
  },
  getSidetreeTransactions: ({ sidetree, set }) => async ({ limit }) => {
    set({ loading: true });
    const data = await sidetree.getTransactions({ limit });
    set({ sidetreeTxns: data.reverse(), loading: false });
  },
  getAll: ({ snackbarMessage, sidetree, set }) => async () => {
    set({ resolving: true });
    try {
      const data = await sidetree.db.readCollection('did:documentRecord');
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
  resolveDID: ({
    didResolved,
    sidetree,
    snackbarMessage,
    set,
  }) => async (did) => {
    set({ resolving: true });
    try {
      const doc = await sidetree.resolve(did, true);
      if (doc) {
        didResolved({ didDocument: doc });
        snackbarMessage({
          snackbarMessage: {
            message: `Resolved ${doc.id}`,
            variant: 'success',
            open: true,
          },
        });
      }
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
  getSidetreeOperationsFromTransactionHash: ({
    sidetree,
    set,
  }) => async (transactionHash) => {
    set({ loading: true });
    const summary = await sidetree.getTransactionSummary(transactionHash);
    set({ sidetreeTransactionSummary: summary, loading: false });
  },
});
