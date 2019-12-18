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

module.exports = getTransactions;
