const { executeSequentially, syncTransaction } = require('../func');

const getFirstUnprocessedBlockNumber = (transactionsAlreadyProcessed) => {
  const firstUnprocessedTransaction = transactionsAlreadyProcessed
    .sort((t1, t2) => t1.transactionNumber - t2.transactionNumber)
    .reduce(
      (acc, t) => {
        if (t.transactionNumber === acc.transactionNumber + 1) {
          return t;
        }
        return acc;
      },
      { transactionNumber: -1, transactionTime: 0 },
    );
  return firstUnprocessedTransaction.transactionTime;
};

const sync = sidetree => async () => {
  // Get a set of transactions that have only been processed from cache
  const transactionsAlreadyProcessed = await sidetree.db.readCollection('transaction');
  const processedSet = new Set(transactionsAlreadyProcessed.map(t => t.transactionNumber));
  // Get all transactions from the smart contract
  const fromBlock = getFirstUnprocessedBlockNumber(transactionsAlreadyProcessed);
  const transactions = await sidetree.blockchain.getTransactions(
    fromBlock,
    'latest',
    { omitTimestamp: true },
  );
  const transactionQueue = transactions
    // Only process transactions that haven't been processed
    .filter(transaction => !processedSet.has(transaction.transactionNumber))
    // Only process the first 100 unprocessed transactions
    .slice(0, 100);
  return executeSequentially(t => syncTransaction(sidetree, t), transactionQueue);
};

module.exports = sync;
