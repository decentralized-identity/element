const batchFileToOperations = require('../../func/batchFileToOperations');

// const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on(
    'element:sidetree:process:batchFile',
    async ({ transaction, anchorFile, batchFile }) => {
      try {
        const operations = batchFileToOperations(batchFile);
        // TODO: operation json schema validation here..
        operations.map(operation => sidetree.serviceBus.emit('element:sidetree:operation', {
          transaction,
          anchorFile,
          batchFile,
          operation,
        }));
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
