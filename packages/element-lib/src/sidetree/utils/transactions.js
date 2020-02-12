const getTransactions = sidetree => async ({ limit } = {}) => {
  let transactions = await sidetree.blockchain.getTransactions(0, 'latest', {
    omitTimestamp: true,
  });
  if (limit) {
    transactions = transactions.slice(-limit);
  }
  const lastTransactionsWithTimestamp = await sidetree.blockchain.extendSidetreeTransactionWithTimestamp(
    transactions
  );
  return lastTransactionsWithTimestamp;
};

const getTransactionSummary = sidetree => async transactionHash => {
  const blockNumber = await sidetree.blockchain.getTransactionsBlockNumber(
    transactionHash
  );
  const transactions = await sidetree.blockchain.getTransactions(
    blockNumber,
    blockNumber
  );
  const transaction = transactions.find(
    t => t.transactionHash === transactionHash
  );
  const anchorFile = await sidetree.func.readThenWriteToCache(
    sidetree,
    transaction.anchorFileHash
  );
  const batchFile = await sidetree.func.readThenWriteToCache(
    sidetree,
    anchorFile.batchFileHash
  );
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
