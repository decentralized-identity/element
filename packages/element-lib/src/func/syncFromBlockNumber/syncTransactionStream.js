module.exports = async ({
  transactionTime, blockchain, stream, db, serviceBus,
}) => {
  if (db) {
    let docs = await db.readCollection('element:sidetree:transaction');
    docs = docs.sort((a, b) => (a.transactionTime > b.transactionTime ? 1 : -1));
    if (!docs.length) {
      // eslint-disable-next-line
      stream = await blockchain.getTransactions(transactionTime);
    } else {
      // eslint-disable-next-line
      stream = docs;
      const lastTransactionTime = stream[stream.length - 1].transactionTime;
      const newTransactions = await blockchain.getTransactions(lastTransactionTime + 1);
      // eslint-disable-next-line
      stream = [...stream, ...newTransactions].sort((a, b) => a.transactionTime > b.transactionTime ? 1 : -1,);
    }
  } else {
    // eslint-disable-next-line
    stream = await blockchain.getTransactions(transactionTime);
  }

  // eslint-disable-next-line
  stream = stream.map(s => ({
    transaction: s,
  }));

  // eslint-disable-next-line
  stream = stream.filter(s => s.transaction.failing === undefined);

  if (serviceBus) {
    stream.map(s => serviceBus.emit('element:sidetree:transaction', {
      transaction: s.transaction,
    }));
  }

  return stream;
};
