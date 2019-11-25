/* eslint-disable arrow-body-style */
const schema = require('../../schema');
const { executeSequentially, syncTransaction } = require('../func');

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
