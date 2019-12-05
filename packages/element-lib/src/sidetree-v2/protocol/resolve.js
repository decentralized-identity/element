/* eslint-disable arrow-body-style */
const { payloadToHash, verifyOperationSignature } = require('../func');

const isSignatureValid = async (didDocument, operation) => {
  const { kid } = operation.decodedOperation.header;
  const signingKey = didDocument.publicKey.find(pubKey => pubKey.id === kid);
  if (!signingKey) {
    throw new Error('signing key not found');
  }
  const valid = await verifyOperationSignature({
    encodedOperationPayload: operation.decodedOperation.payload,
    signature: operation.decodedOperation.signature,
    publicKey: signingKey.publicKeyHex,
  });
  if (!valid) {
    throw new Error('signature is not valid');
  }
};

const create = async (state, operation) => {
  return {
    ...operation.decodedOperationPayload,
    id: `did:elem:${payloadToHash(operation.decodedOperationPayload)}`,
  };
};

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

const update = async (state, operation, lastValidOperation) => {
  const previousOperationHash = lastValidOperation.operation.operationHash;
  if (previousOperationHash === undefined || state === undefined) {
    throw new Error('no valid previous operation');
  }

  const { decodedOperationPayload } = operation;
  if (decodedOperationPayload.previousOperationHash !== previousOperationHash) {
    throw new Error('previous operation hash should match the hash of the latest valid operation');
  }

  return decodedOperationPayload.patches.reduce(applyPatch, state);
};

const recover = async (state, operation) => {
  if (!state) {
    throw new Error('no create operation');
  }
  await isSignatureValid(state, operation);
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
  await isSignatureValid(state, operation);
  return undefined;
};

const applyOperation = async (state, operation, lastValidOperation) => {
  const type = operation.decodedOperation.header.operation;
  let newState = state;
  try {
    switch (type) {
      case 'create':
        newState = await create(state, operation);
        break;
      case 'update':
        newState = await update(state, operation, lastValidOperation);
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
  const createAndRecoverAndRevokeOperations = operations.filter((op) => {
    const type = op.operation.decodedOperation.header.operation;
    return ['create', 'recover', 'delete'].includes(type);
  });
  // Apply "full" operations first.
  let lastValidFullOperation;
  let didDocument = await createAndRecoverAndRevokeOperations
    .reduce((promise, operation) => {
      return promise.then(async (acc) => {
        // TODO operation validation
        const { valid, newState } = await applyOperation(acc, operation.operation);
        if (valid) {
          lastValidFullOperation = operation;
        }
        return newState;
      });
    }, Promise.resolve(undefined));
  // If no full operation found at all, the DID is not anchored.
  if (lastValidFullOperation === undefined) {
    return undefined;
  }

  // Get only update operations that came after the create or last recovery operation.
  const lastFullOperationNumber = lastValidFullOperation.transaction.transactionNumber;
  const updateOperations = operations.filter((op) => {
    const type = op.operation.decodedOperation.header.operation;
    return type === 'update' && op.transaction.transactionNumber > lastFullOperationNumber;
  });

  // Apply "update/delta" operations.
  let lastValidOperation = lastValidFullOperation;
  didDocument = await updateOperations
    .reduce((promise, operation) => {
      return promise.then(async (acc) => {
        const { valid, newState } = await applyOperation(
          acc, operation.operation, lastValidOperation,
        );
        if (valid) {
          lastValidOperation = operation;
        }
        return newState;
      });
    }, Promise.resolve(didDocument));

  return didDocument;
};

module.exports = resolve;
