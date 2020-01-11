/* eslint-disable arrow-body-style */
const { verifyOperationSignature } = require('../../func');
const { isDidDocumentModelValid, isKeyValid } = require('../utils/validation');

const isSignatureValid = async (didDocument, operation) => {
  const { kid } = operation.decodedHeader;
  const signingKey = didDocument.publicKey.find(pubKey => pubKey.id === kid);
  if (!signingKey) {
    throw new Error('signing key not found');
  }

  const valid = await verifyOperationSignature(
    operation.decodedOperation.protected,
    operation.decodedOperation.payload,
    operation.decodedOperation.signature,
    signingKey.publicKeyHex,
  );
  if (!valid) {
    throw new Error('signature is not valid');
  }
};

const addControllerToPublicKey = (controller, publicKey) => {
  if (typeof publicKey === 'string' || Array.isArray(publicKey)) {
    return publicKey;
  }
  return {
    ...publicKey,
    controller: publicKey.controller || controller,
  };
};

// const fixPublicKeyId = (did, publicKey) => {
//   if (typeof publicKey === 'string') {
//     const isFragment = publicKey.startsWith('#');
//     return isFragment ? `${did}${publicKey}` : publicKey;
//   }
//   const isFragmentId = publicKey.id.startsWith('#');
//   // If public key is an object, add a controller qualified id 
//   return {
//     ...publicKey,
//     id: isFragmentId ? `${did}${publicKey.id}` : publicKey.id,
//   };
//
// };

const transformDidDocument = (didDocument) => {
  const transformProperties = [
    'assertionMethod',
    'authentication',
    'capabilityDelegation',
    'capabilityInvocation',
    'publicKey',
    'keyAgreement',
  ];
  const transformed = Object.entries(didDocument).reduce((acc, [property, value]) => {
    if (transformProperties.includes(property)) {
      return {
        ...acc,
        [property]: value.map(pk => addControllerToPublicKey(didDocument.id, pk)),
      }
    }
    return {
      ...acc,
      [property]: value,
    }
  }, {});
  return transformed;
};

const create = async (state, operation, lastValidOperation) => {
  const previousOperationHash = lastValidOperation && lastValidOperation.operation.operationHash;
  if (previousOperationHash !== undefined || state) {
    throw new Error('cannot have another operation before a create operation');
  }

  const originalDidDocument = operation.decodedOperationPayload;
  // Validate did document model
  isDidDocumentModelValid(originalDidDocument);
  await isSignatureValid(originalDidDocument, operation);
  const did = `did:elem:${operation.operationHash}`;
  // Add id to did doc
  const didDocument = {
    ...operation.decodedOperationPayload,
    id: did,
  };
  // Add controller property to each public key
  const transformedDidDocument = transformDidDocument(didDocument);
  return transformedDidDocument;
};

const applyPatch = (didDocument, patch) => {
  if (patch.action === 'add-public-keys') {
    const publicKeySet = new Set(didDocument.publicKey.map(key => key.id));
    // Validate keys
    patch.publicKeys.forEach(isKeyValid);
    return patch.publicKeys.reduce((currentState, publicKey) => {
      if (!publicKeySet.has(publicKey)) {
        return {
          ...currentState,
          publicKey: [
            ...currentState.publicKey,
            addControllerToPublicKey(didDocument.id, publicKey),
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
  const addVerificationMethodToProperty = (propertyName, verificationMethod) => {
    // eslint-disable-next-line security/detect-object-injection
    const property = didDocument[propertyName] || [];
    return {
      ...didDocument,
      [propertyName]: [
        ...property,
        verificationMethod,
      ],
    };
  };

  const removeVerificationMethodFromProperty = (propertyName, id) => {
    // eslint-disable-next-line security/detect-object-injection
    const property = didDocument[propertyName] || [];
    const filtered = property.filter((verificationMethod) => {
      if (typeof verificationMethod === 'string') {
        return verificationMethod !== id;
      }
      return verificationMethod.id !== id;
    })
    return {
      ...didDocument,
      [propertyName]: filtered,
    }
  };

  if (patch.action === 'add-authentication') {
    return addVerificationMethodToProperty('authentication', patch.verificationMethod);
  }
  if (patch.action === 'remove-authentication') {
    return removeVerificationMethodFromProperty('authentication', patch.id)
  }
  if (patch.action === 'add-assertion-method') {
    return addVerificationMethodToProperty('assertionMethod', patch.verificationMethod);
  }
  if (patch.action === 'remove-assertion-method') {
    return removeVerificationMethodFromProperty('assertionMethod', patch.id)
  }
  if (patch.action === 'add-capability-delegation') {
    return addVerificationMethodToProperty('capabilityDelegation', patch.verificationMethod);
  }
  if (patch.action === 'remove-capability-delegation') {
    return removeVerificationMethodFromProperty('capabilityDelegation', patch.id)
  }
  if (patch.action === 'add-capability-invocation') {
    return addVerificationMethodToProperty('capabilityInvocation', patch.verificationMethod);
  }
  if (patch.action === 'remove-capability-invocation') {
    return removeVerificationMethodFromProperty('capabilityInvocation', patch.id)
  }
  if (patch.action === 'add-key-agreement') {
    return addVerificationMethodToProperty('keyAgreement', patch.verificationMethod);
  }
  if (patch.action === 'remove-key-agreement') {
    return removeVerificationMethodFromProperty('keyAgreement', patch.id)
  }
  if (patch.action === 'add-service-endpoint') {
    const service = didDocument.service || [];
    return {
      ...didDocument,
      service: [
        ...service,
        {
          id: patch.id,
          type: patch.type,
          serviceEndpoint: patch.serviceEndpoint
        }
      ]
    };
  }
  if (patch.action === 'remove-service-endpoint') {
    const service = didDocument.service || [];
    const filteredService = service.filter(s => s.id !== patch.id)
    return {
      ...didDocument,
      service: filteredService,
    }
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

  await isSignatureValid(state, operation);
  return decodedOperationPayload.patches.reduce(applyPatch, state);
};

const recover = async (state, operation) => {
  if (!state) {
    throw new Error('no create operation');
  }
  await isSignatureValid(state, operation);
  const { didUniqueSuffix, newDidDocument } = operation.decodedOperationPayload;
  // Validate did document model
  isDidDocumentModelValid(newDidDocument);
  return {
    ...newDidDocument,
    id: `did:elem:${didUniqueSuffix}`,
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
  const type = operation.decodedHeader.operation;
  let newState = state;
  try {
    switch (type) {
      case 'create':
        newState = await create(state, operation, lastValidOperation);
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
    console.error(e.message);
    return { valid: false, newState };
  }
};
const resolve = sidetree => async (did, justInTime = false) => {
  const didUniqueSuffix = did.split(':').pop();
  if (justInTime) {
    // If the justInTime flag is true then perform a partial sync to only sync
    // the batch files containing operations for that didUniqueSuffix
    await sidetree.sync(didUniqueSuffix);
  }
  const operations = await sidetree.db.readCollection(didUniqueSuffix);
  // eslint-disable-next-line max-len
  operations.sort((op1, op2) => op1.transaction.transactionNumber - op2.transaction.transactionNumber);
  const createAndRecoverAndRevokeOperations = operations.filter((op) => {
    const type = op.operation.decodedHeader.operation;
    return ['create', 'recover', 'delete'].includes(type);
  });
  // Apply 'full' operations first.
  let lastValidFullOperation;
  let didDocument = await createAndRecoverAndRevokeOperations
    .reduce((promise, operation) => {
      return promise.then(async (acc) => {
        const { valid, newState } = await applyOperation(
          acc, operation.operation, lastValidFullOperation,
        );
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
    const type = op.operation.decodedHeader.operation;
    return type === 'update' && op.transaction.transactionNumber > lastFullOperationNumber;
  });

  // Apply 'update/delta' operations.
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

  if (didDocument) {
    await sidetree.db.write(didDocument.id, {
      type: 'did:documentRecord',
      record: {
        lastTransaction: lastValidOperation.transaction,
        doc: didDocument,
      },
    });
  }
  return didDocument;
};

module.exports = resolve;
