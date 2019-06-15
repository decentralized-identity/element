module.exports = async ({ stream, sidetree }) => {
  let docs = await sidetree.db.readCollection('element:sidetree:transaction');
  docs = docs.sort((a, b) => (a.transactionTime > b.transactionTime ? 1 : -1));

  if (!docs.length) {
    // eslint-disable-next-line
    stream = await sidetree.getTransactions();
  } else {
    // eslint-disable-next-line
    stream = docs;
    const lastTransactionTimeHash = stream[stream.length - 1].transactionTimeHash;

    const newTransactions = await sidetree.getTransactions({
      since: 0,
      transactionTimeHash: lastTransactionTimeHash,
    });

    // eslint-disable-next-line
    stream = [...stream, ...newTransactions].sort((a, b) => a.transactionTime > b.transactionTime ? 1 : -1,);
  }

  // eslint-disable-next-line
  // stream = await sidetree.getTransactions();

  // eslint-disable-next-line
  stream = stream.map(s => ({
    transaction: s,
  }));
  
  console.log(stream);

  return stream;
};
