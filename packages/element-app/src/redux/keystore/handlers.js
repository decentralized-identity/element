import { withHandlers } from 'recompose';

import element from '@transmute/element-lib';
import DIDWallet from '@transmute/did-wallet';

export default withHandlers({
  doImportKeystore: ({ setKeystoreProp }) => async data => {
    setKeystoreProp({
      keystore: { data },
    });
  },
  doCreateWalletKeystore: ({ setKeystoreProp }) => async () => {
    const wall = await element.op.getNewWallet('did:elem');
    setKeystoreProp({
      keystore: {
        data: {
          keys: wall.keys,
        },
      },
    });
  },
  doUpdateKeystore: ({ setKeystoreProp }) => async keystoreString => {
    const wall = DIDWallet.create({
      keys: Object.values(JSON.parse(keystoreString)),
    });
    setKeystoreProp({
      keystore: {
        data: {
          keys: wall.keys,
        },
      },
    });
  },
  doDeleteKeystore: ({ setKeystoreProp }) => async () => {
    setKeystoreProp({
      keystore: null,
    });
  },
  doToggleKeystore: ({ keystore, setKeystoreProp }) => async password => {
    setKeystoreProp({ loading: true });
    try {
      if (typeof keystore.keystore.data === 'string') {
        const wall = DIDWallet.create(keystore.keystore.data);
        wall.unlock(password);
        setKeystoreProp({
          keystore: {
            data: {
              keys: wall.keys,
            },
          },
        });
      } else {
        const wall = DIDWallet.create({
          keys: Object.values(keystore.keystore.data.keys),
        });
        wall.lock(password);
        setKeystoreProp({
          keystore: {
            data: wall.ciphered,
          },
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    setKeystoreProp({ loading: false });
  },
});
