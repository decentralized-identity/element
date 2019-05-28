import { withHandlers } from 'recompose';

const didWallet = require('@transmute/did-wallet');
const _ = require('lodash');

export default withHandlers({
  importCipherTextWallet: ({
    cipherTextWalletImported,
    snackbarMessage,
    set,
  }) => async (cipherTextWallet) => {
    set({ loading: true });
    try {
      cipherTextWalletImported({ data: cipherTextWallet });
      snackbarMessage({
        snackbarMessage: {
          message: 'Imported wallet.',
          variant: 'success',
          open: true,
        },
      });
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not import wallet.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ loading: false });
  },
  toggleWallet: ({
    wallet,
    walletDecrypted,
    walletEncrypted,
    snackbarMessage,
    set,
  }) => async (password) => {
    set({ loading: true });
    try {
      let message;

      if (typeof wallet.data === 'string') {
        const wall = didWallet.create(wallet.data);
        wall.unlock(password);

        walletDecrypted({ data: wall });
        message = 'Unlocked wallet.';
      } else {
        const wall = didWallet.create({
          keys: _.values(wallet.data.keys),
        });
        wall.lock(password);

        walletEncrypted({ data: wall.ciphered });
        message = 'Locked wallet.';
      }
      snackbarMessage({
        snackbarMessage: {
          message,
          variant: 'success',
          open: true,
        },
      });
    } catch (e) {
      console.error(e);
      snackbarMessage({
        snackbarMessage: {
          message: 'Could not unlock wallet.',
          variant: 'error',
          open: true,
        },
      });
    }
    set({ loading: false });
  },
  addKeyToWallet: ({ snackbarMessage, set, wallet }) => async (key) => {
    set({ resolving: true });
    const wall = didWallet.create({
      keys: _.values(wallet.data.keys),
    });
    wall.addKey(key);
    set({ data: wall });
    snackbarMessage({
      snackbarMessage: {
        message: 'Key added to wallet. Be sure to export.',
        variant: 'info',
        open: true,
      },
    });
  },
});
