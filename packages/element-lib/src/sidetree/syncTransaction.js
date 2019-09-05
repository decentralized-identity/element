const batchFileToOperations = require('../func/batchFileToOperations');
const reducer = require('../reducer');

module.exports = (sidetree) => {
  // eslint-disable-next-line
  sidetree.syncTransaction =  async ({ transaction }) => {
    await sidetree.db.write(`element:sidetree:transaction:${transaction.transactionTimeHash}`, {
      type: 'element:sidetree:transaction',
      ...transaction,
    });

    const anchorFile = await sidetree.getAnchorFile(transaction.anchorFileHash);
    if (!anchorFile) {
      return null;
    }
    const batchFile = await sidetree.getBatchFile(anchorFile.batchFileHash);
    if (!batchFile) {
      return null;
    }
    const operations = batchFileToOperations(batchFile);
    const anchoredOperations = operations.map(operation => ({ operation, transaction }));
    // TODO: write if not written
    const cachedPromises = anchoredOperations.map(async op => sidetree.db.write(`element:sidetree:operation:${op.operation.operationHash}`, {
      type: 'element:sidetree:operation',
      transaction: op.transaction,
      operation: op.operation,
    }));

    await Promise.all(cachedPromises);

    // FIXME
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
  };
};
