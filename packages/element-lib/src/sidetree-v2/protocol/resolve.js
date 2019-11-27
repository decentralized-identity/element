/* eslint-disable arrow-body-style */
const jsonpatch = require('fast-json-patch');
const { payloadToHash } = require('../func');

const reducer = (state = {}, record) => {
  const { operation } = record;
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
  // TODO test that
  // eslint-disable-next-line max-len
  operations.sort((op1, op2) => op1.transaction.transactionNumber - op2.transaction.transactionNumber);
  // TODO operation validation
  const didDocument = operations.reduce(reducer, null);
  return didDocument;
};

module.exports = resolve;
