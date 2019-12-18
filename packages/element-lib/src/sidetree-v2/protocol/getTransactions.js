const getTransactions = sidetree => async () => {
  const transactions = await sidetree.blockchain.getTransactions(
    0,
    'latest',
    { omitTimestamp: true },
  );
  return transactions;
};

module.exports = getTransactions;
