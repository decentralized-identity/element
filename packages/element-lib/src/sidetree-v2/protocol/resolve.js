/* eslint-disable arrow-body-style */
const jsonpatch = require('fast-json-patch');
const { payloadToHash, verifyOperationSignature } = require('../func');

const create = (state, operation) => ({
  ...operation.decodedOperationPayload,
  id: `did:elem:${payloadToHash(operation.decodedOperationPayload)}`,
});

const update = (state, operation) => {
  return operation.decodedOperationPayload.patch.reduce(jsonpatch.applyReducer, state);
};

const recover = (state, operation) => {
  return state;
};

const deletE = async (state, operation) => {
  return state;
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
