const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:download:anchorFile', async ({ transaction }) => {
    try {
      const isValidTransaction = schema.validator.isValid(
        transaction,
        schema.schemas.sidetreeTransaction,
      );
      if (!isValidTransaction) {
        throw new Error('transaction is not valid json schema');
      }
      const anchorFile = await sidetree.getAnchorFile(transaction.anchorFileHash);

      const isAnchorFileValid = schema.validator.isValid(
        anchorFile,
        schema.schemas.sidetreeAnchorFile,
      );
      if (!isAnchorFileValid) {
        throw new Error('anchorFile is not valid json schema');
      }

      sidetree.serviceBus.emit('element:sidetree:download:batchFile', {
        transaction,
        anchorFile,
      });
    } catch (e) {
      if (e.status === 409) {
        // Document update conflict
        // Meaning we already have this operation.
        // No OP
      } else {
        console.warn(e);
      }
    }
  });
};
