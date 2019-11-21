/* eslint-disable arrow-body-style */
const express = require('express');
const { schema, func } = require('@transmute/element-lib');

const router = express.Router();

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

const syncTransaction = sidetree => async (transaction) => {
  const { transactionNumber } = transaction;
  const anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
  if (!schema.validator.isValid(anchorFile, schema.schemas.sidetreeAnchorFile)) {
    // console.warn('anchorFile not valid', anchorFile);
    return null;
  }
  const batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
  if (!schema.validator.isValid(batchFile, schema.schemas.sidetreeBatchFile)) {
    // console.warn('batch file not valid', anchorFile);
    return null;
  }
  const operations = func.batchFileToOperations(batchFile);
  const operationsByDidUniqueSuffixes = operations.map((operation) => {
    const { decodedOperationPayload } = operation;
    const didUniqueSuffix = decodedOperationPayload.didUniqueSuffix
      ? decodedOperationPayload.didUniqueSuffix
      : func.payloadToHash(decodedOperationPayload);
    return {
      type: didUniqueSuffix,
      didUniqueSuffix,
      transactionNumber,
      ...operation,
    };
  });
  const writeOperationToCache = op => sidetree.db.write(`operation:${op.operationHash}`, op);
  await executeSequentially(writeOperationToCache, operationsByDidUniqueSuffixes);
  return sidetree.db.write(`transaction:${transaction.transactionNumber}`, {
    type: 'transaction',
    transactionNumber,
  });
};

const sync = async (sidetree) => {
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
  const toProcess = unprocessedTransactions.slice(0, 50);
  return executeSequentially(syncTransaction(sidetree), toProcess);
};

router.get('/sync', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree');
    // await sidetree.db.reset();
    await sync(sidetree);
    res.status(200).send({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
