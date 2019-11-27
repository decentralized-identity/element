/* eslint-disable arrow-body-style */
const jsonpatch = require('fast-json-patch');
const { payloadToHash } = require('../func');

const reducer = (state = {}, operation) => {
  const type = operation.decodedOperation.header.operation;
  switch (type) {
    case 'create':
      return {
        ...operation.decodedOperationPayload,
        id: `did:elem:${payloadToHash(operation.decodedOperationPayload)}`,
      };
    case 'update':
      return operation.decodedOperationPayload.patch.reduce(jsonpatch.applyReducer, state);
    case 'recover':
      return state;
    case 'delete':
      return state;
    default:
      throw new Error('Operation type not handled', operation);
  }
};

const resolve = sidetree => async (did) => {
  const didUniqueSuffix = did.split(':').pop();
  const operations = await sidetree.db.readCollection(didUniqueSuffix);
  operations.sort((op1, op2) => op1.transactionNumber > op2.transactionNumber);
  // TODO operation validation
  const didDocument = operations.reduce(reducer, {});
  return didDocument;
};

module.exports = resolve;
