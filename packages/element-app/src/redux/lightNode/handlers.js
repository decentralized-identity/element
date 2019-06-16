import { withHandlers } from 'recompose';

import * as elementService from '../../services/element';

import config from '../../config';
import { sidetree } from '../../services/sidetree';

export default withHandlers({
  getSidetreeTransactions: ({ set }) => async (args) => {
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

  getSidetreeOperationsFromTransactionTimeHash: ({ set }) => async (transactionTimeHash) => {
    set({ loading: true });
    const summary = await sidetree.getTransactionSummary(transactionTimeHash);
    set({ sidetreeTransactionSummary: summary, loading: false });
  },

  getOperationsForUID: ({ set }) => async (uid) => {
    set({ loading: true });
    const didDocumentForOperations = await sidetree.resolve(`did:elem:${uid}`);
    const record = await sidetree.getOperations(uid);
    set({ sidetreeOperations: record, didDocumentForOperations, loading: false });
  },

  getDefaultDID: ({ set }) => async (wallet) => {
    const defaultDID = elementService.walletToDID(wallet);
    set({ predictedDefaultDID: defaultDID });
    const resolvedDefaultDID = await elementService.resolveDID(defaultDID);
    if (resolvedDefaultDID) {
      set({ defaultDID, resolvedDefaultDID });
    } else {
      set({ defaultDID: null, resolvedDefaultDID: null });
    }
  },
  createDefaultDID: ({ snackbarMessage, set }) => async (wallet) => {
    set({ resolving: true });

    try {
      await elementService.createDefaultDID(wallet);
      snackbarMessage({
        snackbarMessage: {
          message: 'Default DID Created... waiting to resolve.',
          variant: 'info',
          open: true,
        },
      });
      const defaultDID = elementService.walletToDID(wallet);
      set({ defaultDID });

      setTimeout(async () => {
        snackbarMessage({
          snackbarMessage: {
            message: 'Resolving Default DID...',
            variant: 'info',
            open: true,
          },
        });
        const resolvedDefaultDID = await elementService.resolveDID(defaultDID);
        set({ resolvedDefaultDID, resolving: false });

        snackbarMessage({
          snackbarMessage: {
            message: 'Resolved Default DID.',
            variant: 'success',
            open: true,
          },
        });
      }, 10 * 1000);
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
  getAll: ({ snackbarMessage, set }) => async () => {
    set({ resolving: true });

    try {
      const all = await sidetree.blockchain.getTransactions(config.ELEMENT_START_BLOCK, 'latest');
      const lastTransaction = all.pop();

      await sidetree.sync({
        fromTransactionTime: config.ELEMENT_START_BLOCK,
        toTransactionTime: lastTransaction.transactionTime,
      });
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

  addKeyToDIDDocument: ({ snackbarMessage, set }) => async (wallet, key) => {
    set({ resolving: true });
    try {
      await elementService.addKeyToDIDDocument(wallet, key);
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

  removeKeyFromDIDDocument: ({ snackbarMessage, set }) => async (wallet, key) => {
    set({ resolving: true });
    try {
      await elementService.removeKeyFromDIDDocument(wallet, key);
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

  resolveDID: ({ didResolved, snackbarMessage, set }) => async (did) => {
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
          message: 'Could not resolve DID, make sure it is of the form did:elem:uid.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ resolving: false });
  },
});
