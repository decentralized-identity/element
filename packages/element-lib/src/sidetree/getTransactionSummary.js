const batchFileToOperations = require('../func/batchFileToOperations');

module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.getTransactionSummary = async transactionTimeHash => {
    const transaction = await sidetree.db.read(
      `element:sidetree:transaction:${transactionTimeHash}`,
    );
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
