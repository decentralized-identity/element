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
      const transactionPromises = transactions.map((transaction) => {
        const valid = schema.validator.isValid(transaction, schema.schemas.sidetreeTransaction);
        if (!valid) {
          return sidetree.serviceBus.emit('element:sidetree:error:badTransaction', { transaction });
        }
        // TODO: sync if not already synced
        return sidetree.syncTransaction({ transaction });
      });
      // This is where we would add a load balancer if we ever consider use several workers
      // to make the sync process faster
      await Promise.all(transactionPromises);

      sidetree.serviceBus.emit('element:sidetree:sync:stop', {
        syncStopDateTime: moment().toISOString(),
        lastTransactionTime: toTransactionTime,
      });
    },
  );

  sidetree.serviceBus.on(
    'element:sidetree:sync:stop',
    async ({ syncStopDateTime, lastTransactionTime }) => {
      await sidetree.db.write('element:sidetree:sync', {
        type: 'element:sidetree:sync',
        syncStopDateTime,
        lastTransactionTime,
      });
    },
  );
};
