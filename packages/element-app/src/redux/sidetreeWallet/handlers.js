import { withHandlers } from 'recompose';
import { func, op } from '@transmute/element-lib';

export default withHandlers({
  getEdvUpdatePayload: ({ getKey }) => (didUniqueSuffix, edvDidDocKey, lastOperation) => {
    const did = `did:elem:${didUniqueSuffix}`;
    const keyId = `${did}#edv`;
    // FIXME
    const key = {
      id: `${did}#keyAgreement`,
      type: 'X25519KeyAgreementKey2019',
      controller: did,
      publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr',
    };
    const addPublicKeyPatch = {
      action: 'add-public-keys',
      publicKeys: [edvDidDocKey],
    };
    const addAuthenticationPatch = {
      action: 'add-authentication',
      verificationMethod: keyId,
    };
    const addAssertionMethodPatch = {
      action: 'add-assertion-method',
      verificationMethod: keyId,
    };
    const addCapabilityDelegationPatch = {
      action: 'add-capability-delegation',
      verificationMethod: keyId,
    };
    const addCapabilityInvocationPatch = {
      action: 'add-capability-invocation',
      verificationMethod: keyId,
    };
    const addKeyAgreementPatch = {
      action: 'add-key-agreement',
      verificationMethod: key,
    };
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        addPublicKeyPatch,
        addAuthenticationPatch,
        addAssertionMethodPatch,
        addCapabilityDelegationPatch,
        addCapabilityInvocationPatch,
        addKeyAgreementPatch,
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const primaryKey = getKey('#primary');
    return op.makeSignedOperation(header, payload, primaryKey.privateKey);
  },
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
