const { executeSequentially } = require('../../func');
const { getResolveUtils } = require('./resolve-utils');

const resolve = sidetree => async (did, justInTime = false) => {
  const { applyOperation } = getResolveUtils(sidetree);

  sidetree.logger.info(`resolving ${did}`);
  const didUniqueSuffix = did.split(':').pop();
  const mapSync = Boolean(sidetree.parameters.mapSync);
  if (justInTime) {
    if (mapSync) {
      await sidetree.mapSync();
      const cached = await sidetree.db.readCollection(
        `transactions:${didUniqueSuffix}`
      );
      const transactions = cached.map(c => c.transaction);
      await executeSequentially(async t => {
        const cachedTransaction = await sidetree.db.read(
          `transaction:${t.transactionNumber}`
        );
        if (!cachedTransaction) {
          return sidetree.syncTransaction(t);
        }
        return cachedTransaction;
      }, transactions);
    } else {
      // If the justInTime flag is true then perform a partial sync to only sync
      // the batch files containing operations for that didUniqueSuffix
      await sidetree.sync(didUniqueSuffix);
    }
  }
  const operations = await sidetree.db.readCollection(didUniqueSuffix);
  const orderedOperations = sidetree.func.getOrderedOperations(operations);
  const createAndRecoverAndRevokeOperations = orderedOperations.filter(op => {
    const type = op.operation.decodedHeader.operation;
    return ['create', 'recover', 'delete'].includes(type);
  });
  // Apply 'full' operations first.
  let lastValidFullOperation;
  let didDocument = await createAndRecoverAndRevokeOperations.reduce(
    (promise, operation) => {
      return promise.then(async acc => {
        const { valid, newState } = await applyOperation(
          acc,
          operation.operation,
          lastValidFullOperation
        );
        if (valid) {
          lastValidFullOperation = operation;
        }
        return newState;
      });
    },
    Promise.resolve(undefined)
  );
  // If no full operation found at all, the DID is not anchored.
  if (lastValidFullOperation === undefined) {
    return undefined;
  }

  // Get only update operations that came after the create or last recovery operation.
  const lastFullOperationNumber =
    lastValidFullOperation.transaction.transactionNumber;
  const updateOperations = orderedOperations.filter(op => {
    const type = op.operation.decodedHeader.operation;
    return (
      type === 'update' &&
      op.transaction.transactionNumber > lastFullOperationNumber
    );
  });

  // Apply 'update/delta' operations.
  let lastValidOperation = lastValidFullOperation;
  didDocument = await updateOperations.reduce((promise, operation) => {
    return promise.then(async acc => {
      const { valid, newState } = await applyOperation(
        acc,
        operation.operation,
        lastValidOperation
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

  if (didDocument === null || didDocument === undefined) {
    return didDocument;
  }
  didDocument = sidetree.func.toFullyQualifiedDidDocument(didDocument);
  return didDocument;
};

module.exports = resolve;
