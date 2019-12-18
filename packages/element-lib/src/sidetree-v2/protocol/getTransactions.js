const getTransactions = sidetree => async () => {
  const transactions = await sidetree.blockchain.getTransactions(
    0,
    'latest',
    { omitTimestamp: true },
  );
  // Only get the last 20 transactions to avoid crashing the page
  const lastTransactions = transactions.slice(-20);
  const lastTransactionsWithTimestamp = await sidetree.blockchain
    .extendSidetreeTransactionWithTimestamp(lastTransactions);
  return lastTransactionsWithTimestamp;
};

const getTransactionSummary = sidetree => async (transactionTimeHash) => {
  const transaction = await sidetree.getTransactions({ transactionTimeHash });
  const anchorFile = await sidetree.func.readThenWriteToCache(sidetree, transaction.anchorFileHash);
  const batchFile = await sidetree.func.readThenWriteToCache(sidetree, anchorFile.batchFileHash);
  let operations;
  try {
    operations = sidetree.func.batchFileToOperations(batchFile);
  } catch (e) {
    operations = [];
  }
  return {
    transaction,
    anchorFile,
    batchFile,
    operations,
  };
};

module.exports = {
  getTransactions,
  getTransactionSummary,
};
