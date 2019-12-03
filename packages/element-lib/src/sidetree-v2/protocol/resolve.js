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
            {
              ...publicKey,
              // FIXME: Need controller property to be compliant with the protocol
              // controller: didDocument.id,
            },
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
      if (existingKey !== undefined && existingKey.type !== '#recovery') {
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
  // If no previous create operation, or deleted
  if (!state) {
    return state;
  }
  const { kid } = operation.decodedOperation.header;
  const recoveryKey = state.publicKey.find(pubKey => pubKey.id === kid);
  if (!recoveryKey) {
    return state;
  }
  const isSignatureValid = await verifyOperationSignature({
    encodedOperationPayload: operation.decodedOperation.payload,
    signature: operation.decodedOperation.signature,
    publicKey: recoveryKey.publicKeyHex,
  });
  if (!isSignatureValid) {
    return state;
  }
  const { didUniqueSuffix, newDidDocument } = operation.decodedOperationPayload;
  return {
    ...newDidDocument,
    id: `did:elem${didUniqueSuffix}`,
  };
};

const deletE = async (state, operation) => {
  // If no previous create operation, or already deleted
  if (!state) {
    return state;
  }
  const { kid } = operation.decodedOperation.header;
  const signingKey = state.publicKey.find(pubKey => pubKey.id === kid);
  if (!signingKey) {
    return state;
  }
  const isSignatureValid = await verifyOperationSignature({
    encodedOperationPayload: operation.decodedOperation.payload,
    signature: operation.decodedOperation.signature,
    publicKey: signingKey.publicKeyHex,
  });
  if (!isSignatureValid) {
    return state;
  }
  return undefined;
};

const applyOperation = async (state, operation) => {
  const type = operation.decodedOperation.header.operation;
  switch (type) {
    case 'create':
      return create(state, operation);
    case 'update':
      return update(state, operation);
    case 'recover':
      return recover(state, operation);
    case 'delete':
      return deletE(state, operation);
    default:
      throw new Error('Operation type not handled', operation);
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
      return promise.then(acc => applyOperation(acc, operation.operation));
    }, Promise.resolve(undefined));
  return didDocument;
};

module.exports = resolve;
