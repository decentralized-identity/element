const moment = require('moment');
const schema = require('../../schema');
const batchFileToOperations = require('../../func/batchFileToOperations');
const reducer = require('../../reducer');

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
      return transactions.map((transaction) => {
        const valid = schema.validator.isValid(transaction, schema.schemas.sidetreeTransaction);
        if (!valid) {
          return sidetree.serviceBus.emit('element:sidetree:error:badTransaction', { transaction });
        }
        return sidetree.serviceBus.emit('element:sidetree:sync:transaction', {
          transaction,
          toTransactionTime,
        });
      });
    },
  );

  sidetree.serviceBus.on(
    'element:sidetree:sync:transaction',
    async ({ transaction, toTransactionTime }) => {
      await sidetree.db.write(`element:sidetree:transaction:${transaction.transactionTimeHash}`, {
        type: 'element:sidetree:transaction',
        ...transaction,
      });

      const anchorFile = await sidetree.getAnchorFile(transaction.anchorFileHash);
      if (anchorFile) {
        const batchFile = await sidetree.getBatchFile(anchorFile.batchFileHash);
        if (batchFile) {
          const operations = batchFileToOperations(batchFile);
          const anchoredOperations = operations.map(operation => ({ operation, transaction }));
          const cachedPromises = anchoredOperations.map(async op => sidetree.db.write(`element:sidetree:operation:${op.operation.operationHash}`, {
            type: 'element:sidetree:operation',
            transaction: op.transaction,
            operation: op.operation,
          }));

          await Promise.all(cachedPromises);

          // handle breaking protocol change.
          if (anchorFile.didUniqueSuffixes) {
            await Promise.all(
              anchorFile.didUniqueSuffixes.map(async (uid) => {
                let updatedState = {};
                const cachedRecord = await sidetree.db.read(`element:sidetree:did:elem:${uid}`);
                if (cachedRecord && cachedRecord.record) {
                  updatedState = cachedRecord.record;
                }
                // eslint-disable-next-line
                for (const anchoredOperation of anchoredOperations) {
                  // eslint-disable-next-line
                  updatedState = { ...(await reducer(updatedState, anchoredOperation, sidetree)) };
                }

                const record = updatedState[uid];
                if (record) {
                  await sidetree.db.write(`element:sidetree:did:elem:${uid}`, {
                    type: 'element:sidetree:did:documentRecord',
                    record,
                  });
                }
              }),
            );
          }

          if (transaction.transactionTime === toTransactionTime) {
            sidetree.serviceBus.emit('element:sidetree:sync:stop', {
              syncStopDateTime: moment().toISOString(),
              lastTransactionTime: toTransactionTime,
            });
          }
        }
        return null;
      }
      return null;
    },
  );

  sidetree.serviceBus.on('element:sidetree:sync:stop', async ({ syncStopDateTime }) => {
    await sidetree.db.write('element:sidetree:sync', {
      type: 'element:sidetree:sync',
      syncStopDateTime,
    });
  });
};
