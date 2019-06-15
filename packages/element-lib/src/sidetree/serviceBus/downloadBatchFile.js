const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on(
    'element:sidetree:download:batchFile',
    async ({ transaction, anchorFile }) => {
      const isValidTransaction = schema.validator.isValid(
        transaction,
        schema.schemas.sidetreeTransaction,
      );
      if (!isValidTransaction) {
        throw new Error('transaction is not valid json schema');
      }

      let batchFile;
      try {
        batchFile = await sidetree.getBatchFile(anchorFile.batchFileHash);
      } catch (e) {
        sidetree.serviceBus.emit('element:sidetree:error:badBatchFileHash', {
          batchFileHash: anchorFile.anchorFileHash,
        });
      }
      if (batchFile) {
        const isBatchFileValid = schema.validator.isValid(
          batchFile,
          schema.schemas.sidetreeBatchFile,
        );
        if (!isBatchFileValid) {
          throw new Error('batchFile is not valid json schema');
        }

        sidetree.serviceBus.emit('element:sidetree:batchFile', {
          batchFileHash: anchorFile.batchFileHash,
          batchFile,
        });

        sidetree.serviceBus.emit('element:sidetree:process:batchFile', {
          transaction,
          anchorFile,
          batchFile,
        });
      }
    },
  );
};
