module.exports = (sidetree) => {
  // eslint-disable-next-line
  sidetree.getTransactions = async (args = {}) => {
    let transactions;
    let start = 0;
    let end = 'latest';

    const {
      since, transactionTimeHash, transactionTime, count, cacheOnly, omitTimestamp,
    } = args;
    if (cacheOnly) {
      transactions = await sidetree.db.readCollection('element:sidetree:transaction');
    } else {
      if (transactionTime) {
        start = transactionTime;
      }
      if (transactionTimeHash) {
        const blockchainTime = await sidetree.blockchain.getBlockchainTime(transactionTimeHash);
        start = blockchainTime.time;
        // if (count) does not work because count = 0 is a valid argument but evaluates as false
        if (count !== undefined) {
          end = start + count;
        }
      }
      transactions = await sidetree.blockchain.getTransactions(start, end, { omitTimestamp });
      // Update the cache
      const cachedTransactionsPromises = transactions.map(transaction => sidetree.db.write(`element:sidetree:transaction:${transaction.transactionTimeHash}`, {
        type: 'element:sidetree:transaction',
        ...transaction,
      }));
      await Promise.all(cachedTransactionsPromises);
    }
    transactions = transactions.filter(txn => txn.transactionNumber >= (since || 0));

    return transactions;
  };
};
