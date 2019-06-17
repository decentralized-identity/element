const batchFileToOperations = require('../func/batchFileToOperations');

module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.getTransactionSummary = async transactionTimeHash => {
    let [transaction] = await sidetree.getTransactions({
      since: 0,
      transactionTimeHash,
      count: 1,
    });
    if (!transaction) {
      transaction = await sidetree.blockchain.getTransactions(
        transactionTimeHash,
        transactionTimeHash,
      );
    }
    const anchorFile = await sidetree.getAnchorFile(transaction.anchorFileHash);
    const batchFile = await sidetree.getBatchFile(anchorFile.batchFileHash);
    const operations = batchFileToOperations(batchFile).map(operation => ({
      operation,
      transaction,
    }));

    return {
      transaction,
      anchorFile,
      batchFile,
      operations,
    };
  };
};
