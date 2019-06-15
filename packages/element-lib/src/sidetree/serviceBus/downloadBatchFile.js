const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on(
    'element:sidetree:download:batchFile',
    async ({ transaction, anchorFile }) => {
      try {
        const isValidTransaction = schema.validator.isValid(
          transaction,
          schema.schemas.sidetreeTransaction,
        );
        if (!isValidTransaction) {
          throw new Error('transaction is not valid json schema');
        }
        const batchFile = await sidetree.getBatchFile(anchorFile.batchFileHash);

        const isBatchFileValid = schema.validator.isValid(
          batchFile,
          schema.schemas.sidetreeBatchFile,
        );
        if (!isBatchFileValid) {
          throw new Error('batchFile is not valid json schema');
        }

        sidetree.serviceBus.emit('element:sidetree:process:batchFile', {
          transaction,
          anchorFile,
          batchFile,
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
    },
  );
};
