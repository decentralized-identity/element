import { withHandlers } from 'recompose';
import element from '@transmute/element-lib';

const { func, op } = new element.SidetreeV2();

export default withHandlers({
  getMyDidUniqueSuffix: ({ getKey }) => async () => {
    const primaryKey = getKey('#primary');
    const recoveryKey = getKey('#recovery');
    const didDocumentModel = op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey,
    );
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
    const didDocumentModel = op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey,
    );
    const createPayload = await op.getCreatePayload(
      didDocumentModel,
      primaryKey,
    );
    return createPayload;
  },
  createAddKeyRequest: ({ getKey }) => async (
    kid,
    newPublicKey,
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
      kid,
      'signing',
      newPublicKey,
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
