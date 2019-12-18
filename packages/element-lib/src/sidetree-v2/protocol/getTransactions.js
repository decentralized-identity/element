const getTransactions = sidetree => async ({ transactionTimeHash } = {}) => {
  let since = 0;
  let end = 'latest';
  if (transactionTimeHash) {
    const blockchainTime = await sidetree.blockchain.getBlockchainTime(transactionTimeHash);
    since = blockchainTime.time;
    end = since + 1;
  }
  const transactions = await sidetree.blockchain.getTransactions(
    since,
    end,
    { omitTimestamp: true },
  );
  // Only get the last 20 transactions to avoid crashing the page
  const lastTransactions = transactions.slice(-20);
  const lastTransactionsWithTimestamp = await sidetree.blockchain
    .extendSidetreeTransactionWithTimestamp(lastTransactions);
  return lastTransactionsWithTimestamp;
};

const getTransactionSummary = sidetree => async (transactionTimeHash) => {
  const transactions = await sidetree.getTransactions({ transactionTimeHash });
  const transaction = transactions.pop();
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
