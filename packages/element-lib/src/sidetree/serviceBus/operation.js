// const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on(
    'element:sidetree:operation',
    async ({
      transaction,
      //   available, but not used.
      //   anchorFile, batchFile,
      operation,
    }) => {
      try {
        await sidetree.db.write(`element:sidetree:operation:${operation.operationHash}`, {
          type: 'element:sidetree:operation',
          transaction,
          operation,
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
