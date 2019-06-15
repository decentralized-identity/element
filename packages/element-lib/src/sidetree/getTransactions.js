module.exports = (sidetree) => {
  // todo... pass sidetree to sync instead of db and bus.
  // then use helper methods, like sidetree one.
  //   eslint-disable-next-line
  sidetree.getTransactions = async args => {
    let txns;
    let start = 0;
    let end = 'latest';

    if (!args) {
      txns = await sidetree.blockchain.getTransactions(start, 'latest');
    } else {
      const {
        since, transactionTimeHash, count, cacheOnly,
      } = args;

      if (count) {
        const blockchainTime = await sidetree.blockchain.getBlockchainTime(transactionTimeHash);
        start = blockchainTime.time;
        end = blockchainTime.time + count;
      }
      if (cacheOnly) {
        txns = await sidetree.db.readCollection('element:sidetree:transaction');
      } else {
        txns = await sidetree.blockchain.getTransactions(start, end);
        txns.map(txn => sidetree.serviceBus.emit('element:sidetree:transaction', {
          transaction: txn,
        }));
      }
      txns = txns.filter(txn => txn.transactionNumber >= (since || 0));
    }

    return txns;
  };
};
