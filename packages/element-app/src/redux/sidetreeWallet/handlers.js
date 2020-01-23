import { withHandlers } from 'recompose';
import { func, op } from '@transmute/element-lib';

const DIDWallet = require('@transmute/did-wallet');

export default withHandlers({
  getDidDocumentKey: () => walletKey => {
    const { publicKey, tags, encoding } = walletKey;
    const [type, kid] = tags;
    let publicKeyType;
    switch (encoding) {
      case 'base58':
        publicKeyType = 'publicKeyBase58';
        break;
      case 'jwk':
        publicKeyType = 'publicKeyJwk';
        break;
      case 'hex':
      default:
        publicKeyType = 'publicKeyHex';
    }
    return {
      id: kid,
      usage: 'signing',
      type,
      [publicKeyType]: publicKey,
    };
  },
  getMyDidUniqueSuffix: ({ keystore }) => async () => {
    const keys = Object.values(keystore.keystore.data.keys);
    const wall = DIDWallet.create({
      keys,
    });
    const primaryKey = keys.find(k => {
      return k.tags.indexOf('#primary') !== -1;
    });
    const didDocumentModel = op.walletToInitionalDIDDoc(wall);
    const createPayload = await op.getCreatePayload(
      didDocumentModel,
      primaryKey
    );
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload);
    return didUniqueSuffix;
  },
  createDIDRequest: ({ keystore }) => async () => {
    const keys = Object.values(keystore.keystore.data.keys);
    const wall = DIDWallet.create({
      keys,
    });
    const primaryKey = keys.find(k => {
      return k.tags.indexOf('#primary') !== -1;
    });
    const didDocumentModel = op.walletToInitionalDIDDoc(wall);
    const createPayload = await op.getCreatePayload(
      didDocumentModel,
      primaryKey
    );
    return createPayload;
  },
  createAddKeyRequest: ({ keystore }) => async (
    newKey,
    didUniqueSuffix,
    operationHash
  ) => {
    const lastOperation = {
      didUniqueSuffix,
      operation: { operationHash },
    };
    const keys = Object.values(keystore.keystore.data.keys);
    const primaryKey = keys.find(k => {
      return k.tags.indexOf('#primary') !== -1;
    });
    const payload = await op.getUpdatePayloadForAddingAKey(
      lastOperation,
      newKey,
      primaryKey.privateKey
    );
    return payload;
  },
  createRemoveKeyRequest: ({ keystore }) => async (
    kid,
    didUniqueSuffix,
    operationHash
  ) => {
    const lastOperation = {
      didUniqueSuffix,
      operation: { operationHash },
    };
    const keys = Object.values(keystore.keystore.data.keys);
    const primaryKey = keys.find(k => {
      return k.tags.indexOf('#primary') !== -1;
    });
    const payload = await op.getUpdatePayloadForRemovingAKey(
      lastOperation,
      kid,
      primaryKey.privateKey
    );
    return payload;
  },
});
