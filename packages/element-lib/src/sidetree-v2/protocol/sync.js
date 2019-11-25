const {
  executeSequentially,
  syncTransaction,
  isTransactionValid,
} = require('../func');

const sync = sidetree => async () => {
  // Get a set of transactions that have only been processed from cache
  const transactionsAlreadyProcessed = await sidetree.db.readCollection('transaction');
  const processedSet = new Set(transactionsAlreadyProcessed.map(t => t.transactionNumber));
  // Get all transactions from the smart contract
  const transactions = await sidetree.blockchain.getTransactions(
    0,
    'latest',
    { omitTimestamp: true },
  );
  // await sidetree.db.reset();
  const transactionQueue = transactions
    // Only process valid transactions
    .filter(isTransactionValid)
    // Only process transactions that haven't been processed
    .filter(transaction => !processedSet.has(transaction.transactionNumber))
    // Only process the first 100 unprocessed transactions
    .slice(550);
  return executeSequentially(t => syncTransaction(sidetree, t), transactionQueue);
};

module.exports = sync;
