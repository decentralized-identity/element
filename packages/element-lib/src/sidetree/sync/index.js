const { executeSequentially, syncTransaction } = require('../../func/func');

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

// If a onlyDidSuffix argument is specified, only sync the operations of that suffix
const sync = sidetree => async (onlyDidUniqueSuffix = null) => {
  // Get a set of transactions that have only been processed from cache
  const transactionsAlreadyProcessed = await sidetree.db.readCollection('transaction');
  const processedSet = new Set(transactionsAlreadyProcessed.map(t => t.transactionNumber));
  // Get all transactions from the smart contract
  const firstUnprocessedBlock = getFirstUnprocessedBlockNumber(transactionsAlreadyProcessed);
  let checkpoint = 0;
  if (onlyDidUniqueSuffix) {
    checkpoint = await sidetree.db.read(`checkpoint:${onlyDidUniqueSuffix}`);
    checkpoint = checkpoint ? checkpoint.transactionTime : 0;
    checkpoint = checkpoint || 0;
  }
  const fromBlock = Math.max(firstUnprocessedBlock, checkpoint + 1);
  const transactions = await sidetree.blockchain.getTransactions(
    fromBlock,
    'latest',
    { omitTimestamp: true },
  );
  const transactionQueue = transactions
    // Only process transactions that haven't been processed
    .filter(transaction => !processedSet.has(transaction.transactionNumber));
  await executeSequentially(
    t => syncTransaction(sidetree, t, onlyDidUniqueSuffix),
    transactionQueue,
  );
  if (onlyDidUniqueSuffix && transactionQueue.length > 0) {
    const { transactionTime } = transactionQueue.pop();
    await sidetree.db.write(`checkpoint:${onlyDidUniqueSuffix}`, { transactionTime });
  }
};

module.exports = sync;
