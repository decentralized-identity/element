const jsonpatch = require('fast-json-patch');
const { isDidDocumentModelValid, isKeyValid } = require('../utils/validation');

const getResolveUtils = sidetree => {
  const isSignatureValid = async (didDocument, operation) => {
    const { kid } = operation.decodedHeader;
    const suffix = didDocument.id ? didDocument.id.split(':').pop() : '';
    const signingKey = didDocument.publicKey.find(pubKey => {
      return kid === pubKey.id || kid.includes(`${suffix}${pubKey.id}`);
    });
    if (!signingKey) {
      throw new Error('signing key not found');
    }

    const valid = await sidetree.func.verifyOperationSignature(
      operation.decodedOperation.protected,
      operation.decodedOperation.payload,
      operation.decodedOperation.signature,
      signingKey.publicKeyHex
    );
    if (!valid) {
      throw new Error('signature is not valid');
    }
  };

  const create = async (state, operation, lastValidOperation) => {
    const previousOperationHash =
      lastValidOperation && lastValidOperation.operation.operationHash;
    if (previousOperationHash !== undefined || state) {
      throw new Error(
        'cannot have another operation before a create operation'
      );
    }

    const originalDidDocument = operation.decodedOperationPayload;
    // Validate did document model
    isDidDocumentModelValid(originalDidDocument);
    await isSignatureValid(originalDidDocument, operation);
    const { didMethodName } = sidetree.parameters;
    const did = `${didMethodName}:${operation.operationHash}`;
    // Add id to did doc
    const didDocument = { ...operation.decodedOperationPayload, id: did };
    // Add controller property to each public key
    const transformedDidDocument = sidetree.func.transformDidDocument(
      didDocument
    );
    return transformedDidDocument;
  };

  const applyPatch = (didDocument, patch) => {
    if (patch.action === 'ietf-json-patch') {
      try {
        const res = jsonpatch.applyPatch({ ...didDocument }, patch.patches);
        const { newDocument } = res;
        newDocument.publicKey.forEach(isKeyValid);
        const transformedDidDocument = sidetree.func.transformDidDocument(
          newDocument
        );
        return transformedDidDocument;
      } catch (e) {
        sidetree.logger.error(e.message);
        return didDocument;
      }
    }
    if (patch.action === 'add-public-keys') {
      const publicKeySet = new Set(
        didDocument.publicKey.map(publicKey => publicKey.id)
      );
      // Validate keys
      patch.publicKeys.forEach(isKeyValid);
      return patch.publicKeys.reduce((currentState, publicKey) => {
        if (!publicKeySet.has(publicKey)) {
          return {
            ...currentState,
            publicKey: [
              ...currentState.publicKey,

              sidetree.func.addControllerToPublicKey(didDocument.id, publicKey),
            ],
          };
        }
        return currentState;
      }, didDocument);
    }
    if (patch.action === 'remove-public-keys') {
      const publicKeyMap = new Map(
        didDocument.publicKey.map(publicKey => {
          let { id } = publicKey;
          if (id.indexOf(didDocument.id) === -1) {
            // eslint-disable-next-line
            publicKey.id = `${didDocument.id}${publicKey.id}`;
            id = publicKey.id;
          }
          return [id, publicKey];
        })
      );

      return patch.publicKeys.reduce((currentState, publicKey) => {
        const existingKey = publicKeyMap.get(publicKey);

        // Deleting recovery key is NOT allowed.
        if (
          existingKey !== undefined &&
          !(
            existingKey.id === '#recovery' ||
            existingKey.id === `${didDocument.id}#recovery`
          )
        ) {
          publicKeyMap.delete(publicKey);
          return {
            ...currentState,
            publicKey: Array.from(publicKeyMap.values()),
          };
        }
        return currentState;
      }, didDocument);
    }
    const addVerificationMethodToProperty = (
      propertyName,
      verificationMethod
    ) => {
      // eslint-disable-next-line security/detect-object-injection
      const property = didDocument[propertyName] || [];
      return {
        ...didDocument,
        [propertyName]: [...property, verificationMethod],
      };
    };

    const removeVerificationMethodFromProperty = (propertyName, id) => {
      // eslint-disable-next-line security/detect-object-injection
      const property = didDocument[propertyName] || [];
      const filtered = property.filter(verificationMethod => {
        if (typeof verificationMethod === 'string') {
          return verificationMethod !== id;
        }
        return verificationMethod.id !== id;
      });
      return {
        ...didDocument,
        [propertyName]: filtered,
      };
    };

    if (patch.action === 'add-authentication') {
      return addVerificationMethodToProperty(
        'authentication',
        patch.verificationMethod
      );
    }
    if (patch.action === 'remove-authentication') {
      return removeVerificationMethodFromProperty('authentication', patch.id);
    }
    if (patch.action === 'add-assertion-method') {
      return addVerificationMethodToProperty(
        'assertionMethod',
        patch.verificationMethod
      );
    }
    if (patch.action === 'remove-assertion-method') {
      return removeVerificationMethodFromProperty('assertionMethod', patch.id);
    }
    if (patch.action === 'add-capability-delegation') {
      return addVerificationMethodToProperty(
        'capabilityDelegation',
        patch.verificationMethod
      );
    }
    if (patch.action === 'remove-capability-delegation') {
      return removeVerificationMethodFromProperty(
        'capabilityDelegation',
        patch.id
      );
    }
    if (patch.action === 'add-capability-invocation') {
      return addVerificationMethodToProperty(
        'capabilityInvocation',
        patch.verificationMethod
      );
    }
    if (patch.action === 'remove-capability-invocation') {
      return removeVerificationMethodFromProperty(
        'capabilityInvocation',
        patch.id
      );
    }
    if (patch.action === 'add-key-agreement') {
      return addVerificationMethodToProperty(
        'keyAgreement',
        patch.verificationMethod
      );
    }
    if (patch.action === 'remove-key-agreement') {
      return removeVerificationMethodFromProperty('keyAgreement', patch.id);
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
            serviceEndpoint: patch.serviceEndpoint,
          },
        ],
      };
    }
    if (patch.action === 'remove-service-endpoint') {
      const service = didDocument.service || [];
      const filteredService = service.filter(s => s.id !== patch.id);
      return {
        ...didDocument,
        service: filteredService,
      };
    }
    sidetree.logger.warn(`patch action is not supported: ${patch.action}`);
    return didDocument;
  };

  const update = async (state, operation, lastValidOperation) => {
    const previousOperationHash = lastValidOperation.operation.operationHash;
    if (previousOperationHash === undefined || state === undefined) {
      throw new Error('no valid previous operation');
    }

    const { decodedOperationPayload } = operation;
    if (
      decodedOperationPayload.previousOperationHash !== previousOperationHash
    ) {
      throw new Error(
        'previous operation hash should match the hash of the latest valid operation'
      );
    }

    await isSignatureValid(state, operation);
    return decodedOperationPayload.patches.reduce(applyPatch, state);
  };

  const recover = async (state, operation) => {
    if (!state) {
      throw new Error('no create operation');
    }
    await isSignatureValid(state, operation);
    const {
      didUniqueSuffix,
      newDidDocument,
    } = operation.decodedOperationPayload;
    // Validate did document model
    isDidDocumentModelValid(newDidDocument);
    const { didMethodName } = sidetree.parameters;
    return {
      ...newDidDocument,
      id: `${didMethodName}:${didUniqueSuffix}`,
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
          sidetree.logger.warn('Operation type not handled', operation);
      }
      return { valid: true, newState };
    } catch (e) {
      sidetree.logger.warn(e.message);
      return { valid: false, newState };
    }
  };

  return { applyOperation };
};

module.exports = { getResolveUtils };
