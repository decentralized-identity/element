const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:transaction', async ({ transaction }) => {
    try {
      const isValidTransaction = schema.validator.isValid(
        transaction,
        schema.schemas.sidetreeTransaction,
      );
      if (!isValidTransaction) {
        throw new Error('transaction is not valid json schema');
      }
      sidetree.serviceBus.emit('element:sidetree:download:anchorFile', {
        transaction,
      });
      await sidetree.db.write(`element:sidetree:transaction:${transaction.transactionTimeHash}`, {
        type: 'element:sidetree:transaction',
        ...transaction,
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
