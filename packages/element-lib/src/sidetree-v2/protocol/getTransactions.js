const getTransactions = sidetree => async () => {
  const transactions = await sidetree.blockchain.getTransactions(
    0,
    'latest',
    { omitTimestamp: true },
  );
  // Only get the last 20 transactions
  const limit = 20;
  return transactions.slice(-limit);
};

module.exports = getTransactions;
