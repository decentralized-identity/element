/* eslint-disable arrow-body-style */
const { payloadToHash, verifyOperationSignature } = require('../func');

const create = (state, operation) => ({
  ...operation.decodedOperationPayload,
  id: `did:elem:${payloadToHash(operation.decodedOperationPayload)}`,
});

const applyPatch = (didDocument, patch) => {
  if (patch.action === 'add-public-keys') {
    const publicKeySet = new Set(didDocument.publicKey.map(key => key.id));
    return patch.publicKeys.reduce((currentState, publicKey) => {
      if (!publicKeySet.has(publicKey)) {
        return {
          ...currentState,
          publicKey: [
            ...currentState.publicKey,
            { ...publicKey },
          ],
        };
      }
      return currentState;
    }, didDocument);
  }
  if (patch.action === 'remove-public-keys') {
    const publicKeyMap = new Map(didDocument.publicKey.map(publicKey => [publicKey.id, publicKey]));
    return patch.publicKeys.reduce((currentState, publicKey) => {
      const existingKey = publicKeyMap.get(publicKey);
      // Deleting recovery key is NOT allowed.
      if (existingKey !== undefined && existingKey.id !== '#recovery') {
        publicKeyMap.delete(publicKey);
        return {
          ...currentState,
          publicKey: Array.from(publicKeyMap.values()),
        };
      }
      return currentState;
    }, didDocument);
  }
  return didDocument;
};

const update = (state, operation) => {
  const { decodedOperationPayload } = operation;
  return decodedOperationPayload.patches.reduce(applyPatch, state);
};

const recover = async (state, operation) => {
  if (!state) {
    throw new Error('no create operation');
  }
  const { kid } = operation.decodedOperation.header;
  const recoveryKey = state.publicKey.find(pubKey => pubKey.id === kid);
  if (!recoveryKey) {
    throw new Error('recovery key not found');
  }
  const isSignatureValid = await verifyOperationSignature({
    encodedOperationPayload: operation.decodedOperation.payload,
    signature: operation.decodedOperation.signature,
    publicKey: recoveryKey.publicKeyHex,
  });
  if (!isSignatureValid) {
    throw new Error('signature is not valid');
  }
  const { didUniqueSuffix, newDidDocument } = operation.decodedOperationPayload;
  return {
    ...newDidDocument,
    id: `did:elem${didUniqueSuffix}`,
  };
};

const deletE = async (state, operation) => {
  if (!state) {
    throw new Error('no create operation');
  }
  const { kid } = operation.decodedOperation.header;
  const signingKey = state.publicKey.find(pubKey => pubKey.id === kid);
  if (!signingKey) {
    throw new Error('signing key not found');
  }
  const isSignatureValid = await verifyOperationSignature({
    encodedOperationPayload: operation.decodedOperation.payload,
    signature: operation.decodedOperation.signature,
    publicKey: signingKey.publicKeyHex,
  });
  if (!isSignatureValid) {
    throw new Error('signature is not valid');
  }
  return undefined;
};

const applyOperation = async (state, operation) => {
  const type = operation.decodedOperation.header.operation;
  let newState = state;
  try {
    switch (type) {
      case 'create':
        newState = await create(state, operation);
        break;
      case 'update':
        newState = await update(state, operation);
        break;
      case 'recover':
        newState = await recover(state, operation);
        break;
      case 'delete':
        newState = await deletE(state, operation);
        break;
      default:
        console.warn('Operation type not handled', operation);
    }
    return { valid: true, newState };
  } catch (e) {
    return { valid: false, newState };
  }
};

const resolve = sidetree => async (did) => {
  const didUniqueSuffix = did.split(':').pop();
  const operations = await sidetree.db.readCollection(didUniqueSuffix);
  // TODO test that
  // eslint-disable-next-line max-len
  operations.sort((op1, op2) => op1.transaction.transactionNumber - op2.transaction.transactionNumber);
  // TODO operation validation
  const didDocument = await operations
    .reduce((promise, operation) => {
      return promise.then(async (acc) => {
        // TODO: use valid

        // eslint-disable-next-line no-unused-vars
        const { valid, newState } = await applyOperation(acc, operation.operation);
        return newState;
      });
    }, Promise.resolve(undefined));
  return didDocument;
};

module.exports = resolve;
