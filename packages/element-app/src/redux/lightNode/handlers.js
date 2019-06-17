import { withHandlers } from 'recompose';

import config from '../../config';

export default withHandlers({
  // eslint-disable-next-line
  resolveDID: ({ didResolved, sidetree, snackbarMessage, set }) => async did => {
    set({ resolving: true });
    try {
      const doc = await sidetree.resolve(did);
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
  getAll: ({ snackbarMessage, sidetree, set }) => async () => {
    set({ resolving: true });
    try {
      const all = await sidetree.blockchain.getTransactions(config.ELEMENT_START_BLOCK, 'latest');
      const lastTransaction = all.pop();
      await sidetree.sync({
        fromTransactionTime: config.ELEMENT_START_BLOCK,
        toTransactionTime: lastTransaction.transactionTime,
      });
      // sidetree.db.readCollection should only be used in tests. this should be an exposed method.
      const records = await sidetree.db.readCollection('element:sidetree:did:documentRecord');
      // eslint-disable-next-line
      records.sort((a, b) => a.record.lastTransaction.transactionTime > b.record.lastTransaction.transactionTime
        ? -1
        : 1);
      set({ documentRecords: records, resolving: false });
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not resolve all sidetree documents.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },
  getSidetreeTransactions: ({ sidetree, set }) => async (args) => {
    set({ loading: true });
    let records = await sidetree.getTransactions(args);
    if (!records.length) {
      const all = await sidetree.blockchain.getTransactions(config.ELEMENT_START_BLOCK, 'latest');
      const lastTransaction = all.pop();
      await sidetree.sync({
        fromTransactionTime: config.ELEMENT_START_BLOCK,
        toTransactionTime: lastTransaction.transactionTime,
      });
      records = await sidetree.getTransactions(args);
    }
    set({ sidetreeTxns: records.reverse(), loading: false });
  },
  getSidetreeOperationsFromTransactionTimeHash: ({
    sidetree,
    set,
  }) => async (transactionTimeHash) => {
    set({ loading: true });
    const summary = await sidetree.getTransactionSummary(transactionTimeHash);
    set({ sidetreeTransactionSummary: summary, loading: false });
  },
  getOperationsForDidUniqueSuffix: ({ sidetree, set }) => async (didUniqueSuffix) => {
    set({ loading: true });
    const record = await sidetree.getOperations(didUniqueSuffix);
    set({ sidetreeOperations: record, loading: false });
  },
  predictDID: ({ set, sidetree, getMyDidUniqueSuffix }) => async () => {
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    set({
      predictedDID: `did:elem:${didUniqueSuffix}`,
    });
    const myDidDocument = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
    set({ myDidDocument });
    const record = await sidetree.getOperations(didUniqueSuffix);
    set({ sidetreeOperations: record });
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
    await sidetree.createTransactionFromRequests([await createDIDRequest()]);
    snackbarMessage({
      snackbarMessage: {
        message: 'DID Created. Resolving....',
        variant: 'info',
        open: true,
      },
    });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const myDidDocument = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
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

  addKeyToDIDDocument: ({
    snackbarMessage,
    getMyDidUniqueSuffix,
    createAddKeyRequest,
    set,
    sidetree,
  }) => async (key) => {
    set({ resolving: true });
    try {
      snackbarMessage({
        snackbarMessage: {
          message: 'This may take a few minutes.',
          variant: 'info',
          open: true,
        },
      });
      const didUniqueSuffix = await getMyDidUniqueSuffix();
      let myDidDocument = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
      const previousOperationHash = await sidetree.getPreviousOperationHash(didUniqueSuffix);
      await sidetree.createTransactionFromRequests([
        await createAddKeyRequest(key, myDidDocument, previousOperationHash),
      ]);
      await sidetree.sleep(2);
      myDidDocument = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
      set({ myDidDocument });
      snackbarMessage({
        snackbarMessage: {
          message: 'Key added.',
          variant: 'success',
          open: true,
        },
      });
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

  removeKeyFromDIDDocument: ({
    snackbarMessage,
    getMyDidUniqueSuffix,
    createRemoveKeyRequest,
    set,
    sidetree,
  }) => async (key) => {
    set({ resolving: true });
    try {
      snackbarMessage({
        snackbarMessage: {
          message: 'This may take a few minutes.',
          variant: 'info',
          open: true,
        },
      });
      const didUniqueSuffix = await getMyDidUniqueSuffix();
      const previousOperationHash = await sidetree.getPreviousOperationHash(didUniqueSuffix);
      let myDidDocument = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
      await sidetree.createTransactionFromRequests([
        await createRemoveKeyRequest(key, myDidDocument, previousOperationHash),
      ]);
      await sidetree.sleep(10);
      myDidDocument = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
      set({ myDidDocument });
      snackbarMessage({
        snackbarMessage: {
          message: 'Key removed.',
          variant: 'success',
          open: true,
        },
      });
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not remove key.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },
});
