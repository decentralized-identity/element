const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:download:anchorFile', async ({ transaction }) => {
    const isValidTransaction = schema.validator.isValid(
      transaction,
      schema.schemas.sidetreeTransaction,
    );
    if (!isValidTransaction) {
      throw new Error('transaction is not valid json schema');
    }
    const anchorFile = await sidetree.getAnchorFile(transaction.anchorFileHash);

    if (anchorFile) {
      sidetree.serviceBus.emit('element:sidetree:anchorFile', {
        anchorFileHash: transaction.anchorFileHash,
        anchorFile,
      });

      sidetree.serviceBus.emit('element:sidetree:download:batchFile', {
        transaction,
        anchorFile,
      });
    }
    return anchorFile;
  });
};
