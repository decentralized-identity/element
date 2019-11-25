/* eslint-disable arrow-body-style */
const base64url = require('base64url');
const crypto = require('crypto');
const schema = require('../schema');

// This function applies f, an async function, sequentially to an array of values
// We need it because:
//   - Promise.all executes all promises at the same time instead of sequentially
//   - for loop with await is very bad apparently
// Adapted from: https://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order
const executeSequentially = (f, array) => {
  return array
    .reduce((promise, value) => {
      return promise.then(() => f(value));
    }, Promise.resolve());
};

const encodeJson = payload => base64url.encode(Buffer.from(JSON.stringify(payload)));

const decodeJson = encodedPayload => JSON.parse(base64url.decode(encodedPayload));

const payloadToHash = (payload) => {
  const encodedPayload = encodeJson(payload);
  return base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(encodedPayload))
      .digest(),
  );
};

const getDidUniqueSuffix = (decodedOperation) => {
  switch (decodedOperation.header.operation) {
    case 'create':
      return payloadToHash(decodedOperation.decodedPayload);
    case 'update':
    case 'recover':
    case 'delete':
      return decodedOperation.decodedPayload.didUniqueSuffix;
    default:
      throw Error(`Cannot extract didUniqueSuffixe from: ${decodedOperation}`);
  }
};

const batchFileToOperations = batchFile => batchFile.operations.map((op) => {
  const decodedOperation = decodeJson(op);
  const operationHash = payloadToHash(decodedOperation.payload);
  console.log(decodedOperation.payload);
  const decodedOperationPayload = decodeJson(decodedOperation.payload);
  console.log(decodedOperationPayload);
  return {
    operationHash,
    decodedOperation,
    decodedOperationPayload,
  };
});

const syncTransaction = async (sidetree, transaction) => {
  const { transactionNumber } = transaction;
  const anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
  if (!schema.validator.isValid(anchorFile, schema.schemas.sidetreeAnchorFile)) {
    // TODO
    // console.warn('anchorFile not valid', anchorFile);
    return null;
  }
  const batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
  if (!schema.validator.isValid(batchFile, schema.schemas.sidetreeBatchFile)) {
    // console.warn('batch file not valid', anchorFile);
    return null;
  }
  const operations = batchFileToOperations(batchFile);
  const operationsByDidUniqueSuffixes = operations.map((operation) => {
    const { decodedOperationPayload } = operation;
    const didUniqueSuffix = decodedOperationPayload.didUniqueSuffix
      ? decodedOperationPayload.didUniqueSuffix
      : payloadToHash(decodedOperationPayload);
    return {
      type: didUniqueSuffix,
      didUniqueSuffix,
      transactionNumber,
      ...operation,
    };
  });
  const writeOperationToCache = op => sidetree.db.write(`operation:${op.operationHash}`, op);
  return executeSequentially(writeOperationToCache, operationsByDidUniqueSuffixes)
    .then(() => {
      return sidetree.db.write(`transaction:${transaction.transactionNumber}`, {
        type: 'transaction',
        transactionNumber: transaction.transactionNumber,
      });
    }).catch((error) => {
      console.log(error);
      // https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
      const stringifiedError = JSON.stringify(error, Object.getOwnPropertyNames(error));
      return sidetree.db.write(`transaction:${transaction.transactionNumber}`, {
        type: 'transaction',
        transactionNumber: transaction.transactionNumber,
        error: stringifiedError,
      });
    });
};

const isTransactionValid = (transaction) => {
  const valid = schema.validator.isValid(transaction, schema.schemas.sidetreeTransaction);
  if (!valid) {
    console.warn('bad transaction', transaction);
  }
  return valid;
};


module.exports = {
  executeSequentially,
  encodeJson,
  decodeJson,
  payloadToHash,
  getDidUniqueSuffix,
  batchFileToOperations,
  syncTransaction,
  isTransactionValid,
};
