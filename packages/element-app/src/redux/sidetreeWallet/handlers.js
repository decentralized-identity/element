import { withHandlers } from 'recompose';
import { func, op } from '@transmute/element-lib';

export default withHandlers({
  getDidDocumentKey: () => (walletKey) => {
    const { publicKey, tags, encoding } = walletKey;
    const [type, kid] = tags;
    let publicKeyType;
    switch (encoding) {
      case 'base58':
        publicKeyType = 'publicKeyBase58';
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
  getMyDidUniqueSuffix: ({ getKey }) => async () => {
    const primaryKey = getKey('#primary');
    const recoveryKey = getKey('#recovery');
    const didDocumentModel = op.getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
    const createPayload = await op.getCreatePayload(
      didDocumentModel,
      primaryKey,
    );
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload);
    return didUniqueSuffix;
  },
  createDIDRequest: ({ getKey }) => async () => {
    const primaryKey = getKey('#primary');
    const recoveryKey = getKey('#recovery');
    const didDocumentModel = op.getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
    const createPayload = await op.getCreatePayload(
      didDocumentModel,
      primaryKey,
    );
    return createPayload;
  },
  createAddKeyRequest: ({ getKey }) => async (
    newKey,
    didUniqueSuffix,
    operationHash,
  ) => {
    const lastOperation = {
      didUniqueSuffix,
      operation: { operationHash },
    };
    const primaryKey = getKey('#primary');
    const payload = await op.getUpdatePayloadForAddingAKey(
      lastOperation,
      newKey,
      primaryKey.privateKey,
    );
    return payload;
  },
  createRemoveKeyRequest: ({ getKey }) => async (
    kid,
    didUniqueSuffix,
    operationHash,
  ) => {
    const lastOperation = {
      didUniqueSuffix,
      operation: { operationHash },
    };
    const primaryKey = getKey('#primary');
    const payload = await op.getUpdatePayloadForRemovingAKey(
      lastOperation,
      kid,
      primaryKey.privateKey,
    );
    return payload;
  },
});
