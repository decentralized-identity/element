/* eslint-disable arrow-body-style */
const schema = require('../../schema');
const {
  executeSequentially,
  payloadToHash,
  batchFileToOperations,
} = require('../utils');

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

const sync = sidetree => async () => {
  const transactionsAlreadyProcessed = await sidetree.db.readCollection('transaction');
  const processedSet = new Set(transactionsAlreadyProcessed.map(t => t.transactionNumber));
  const transactions = await sidetree.blockchain.getTransactions(
    0,
    'latest',
    { omitTimestamp: true },
  );
  const validTransactions = transactions
    .filter((transaction) => {
      const valid = schema.validator.isValid(transaction, schema.schemas.sidetreeTransaction);
      if (!valid) {
        console.warn('bad transaction', transaction);
      }
      return valid;
    });
  const unprocessedTransactions = validTransactions
    .filter(transaction => !processedSet.has(transaction.transactionNumber));
  const transactionQueue = unprocessedTransactions.slice(0, 100);
  return executeSequentially(t => syncTransaction(sidetree, t), transactionQueue);
};

module.exports = sync;
