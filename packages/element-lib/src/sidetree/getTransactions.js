module.exports = (sidetree) => {
  // eslint-disable-next-line
  sidetree.getTransactions = async args => {
    let transactions;
    let start = 0;
    let end = 'latest';

    if (!args) {
      transactions = await sidetree.blockchain.getTransactions(start, end);
    } else {
      const {
        since, transactionTimeHash, count, cacheOnly,
      } = args;

      if (transactionTimeHash) {
        const blockchainTime = await sidetree.blockchain.getBlockchainTime(transactionTimeHash);
        start = blockchainTime.time;
        // if (count) does not work because count = 0 is a valid argument but evaluates as false
        if (count !== undefined) {
          end = blockchainTime.time + count;
        }
      }
      if (cacheOnly) {
        transactions = await sidetree.db.readCollection('element:sidetree:transaction');
      } else {
        transactions = await sidetree.blockchain.getTransactions(start, end);
        await Promise.all(
          transactions.map(async (transaction) => {
            await sidetree.db.write(
              `element:sidetree:transaction:${transaction.transactionTimeHash}`,
              {
                type: 'element:sidetree:transaction',
                ...transaction,
              },
            );
          }),
        );
      }
      transactions = transactions.filter(txn => txn.transactionNumber >= (since || 0));
    }

    return transactions;
  };
};
