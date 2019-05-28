import { withHandlers } from 'recompose';

import * as elementService from '../../services/element';

export default withHandlers({
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
      const model = await elementService.syncAll();

      set({ tree: model });
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
      const doc = await elementService.resolveDID(did);
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
