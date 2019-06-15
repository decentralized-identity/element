module.exports = async ({ transactionTime, stream, sidetree }) => {
  let docs = await sidetree.db.readCollection('element:sidetree:transaction');
  docs = docs.sort((a, b) => (a.transactionTime > b.transactionTime ? 1 : -1));

  if (!docs.length) {
    // eslint-disable-next-line
    stream = await sidetree.getTransactions({
      since: 0,
      transactionTime,
    });
  } else {
    // eslint-disable-next-line
    stream = docs;
    const lastTransactionTime = stream[stream.length - 1].transactionTime;

    const newTransactions = await sidetree.getTransactions({
      since: 0,
      transactionTime: lastTransactionTime + 1,
    });

    // eslint-disable-next-line
    stream = [...stream, ...newTransactions].sort((a, b) => a.transactionTime > b.transactionTime ? 1 : -1,);
  }

  // eslint-disable-next-line
  stream = stream.map(s => ({
    transaction: s,
  }));

  // eslint-disable-next-line
  stream = stream.filter(s => s.transaction.failing === undefined);

  return stream;
};
