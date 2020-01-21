import { withHandlers } from 'recompose';
import didWallet from '@transmute/did-wallet';
import element from '@transmute/element-lib';

export default withHandlers({
  getEdvDidDocumentModel: () => (primaryKey, recoveryKey, edvKey) => {
    const keyAgreement = element.crypto.ed25519.X25519KeyPair.fromEdKeyPair({
      publicKeyBase58: edvKey.publicKey,
    });
    const edvKeyReference = edvKey.tags[1];
    const didDocumentModel = {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          type: primaryKey.tags[0],
          id: primaryKey.tags[1],
          usage: 'signing',
          publicKeyHex: primaryKey.publicKey,
        },
        {
          type: recoveryKey.tags[0],
          id: recoveryKey.tags[1],
          usage: 'recovery',
          publicKeyHex: recoveryKey.publicKey,
        },
        {
          type: edvKey.tags[0],
          id: edvKey.tags[1],
          usage: 'signing',
          publicKeyBase58: edvKey.publicKey,
        },
      ],
      authentication: [edvKeyReference],
      assertionMethod: [edvKeyReference],
      capabilityDelegation: [edvKeyReference],
      capabilityInvocation: [edvKeyReference],
      keyAgreement: [
        {
          id: '#keyAgreement',
          type: keyAgreement.type,
          usage: 'signing',
          publicKeyBase58: keyAgreement.publicKeyBase58,
        },
      ],
    };
    return didDocumentModel;
  },
  getKey: ({ wallet }) => kid =>
    Object.values(wallet.data.keys).find(walletKey =>
      walletKey.tags.includes(kid)
    ),
  importCipherTextWallet: ({
    cipherTextWalletImported,
    snackbarMessage,
    set,
  }) => async cipherTextWallet => {
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
  }) => async password => {
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
          keys: Object.values(wallet.data.keys),
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
  addKeyToWallet: ({ snackbarMessage, set, wallet }) => async key => {
    set({ resolving: true });
    const wall = didWallet.create({
      keys: Object.values(wallet.data.keys),
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
