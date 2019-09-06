const moment = require('moment');
const schema = require('../../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on(
    'element:sidetree:sync:start',
    async ({ fromTransactionTime, toTransactionTime }) => {
      const syncStartDateTime = moment().toISOString();
      await sidetree.db.write('element:sidetree:sync', {
        type: 'element:sidetree:sync',
        syncStartDateTime,
      });

      const transactions = await sidetree.blockchain.getTransactions(
        fromTransactionTime,
        toTransactionTime,
      );
      // This is where we would add a load balancer if we ever consider using several workers
      // to make the sync process faster
      const transactionPromises = transactions.map((transaction) => {
        const valid = schema.validator.isValid(transaction, schema.schemas.sidetreeTransaction);
        if (!valid) {
          return sidetree.serviceBus.emit('element:sidetree:error:badTransaction', { transaction });
        }
        return sidetree.syncTransaction({ transaction });
      });
      await Promise.all(transactionPromises);

      const syncStopDateTime = moment().toISOString();
      const lastTransactionTime = toTransactionTime;
      await sidetree.db.write('element:sidetree:sync', {
        type: 'element:sidetree:sync',
        syncStopDateTime,
        lastTransactionTime,
      });
      sidetree.serviceBus.emit('element:sidetree:sync:stop', {
        syncStopDateTime,
        lastTransactionTime,
      });
    },
  );
};
