const batchFileToOperations = require('../func/batchFileToOperations');
const reducer = require('../reducer');

module.exports = async (sidetree) => {
  // eslint-disable-next-line
  sidetree.resolve = async did => {
    const didUniqueSuffix = did.split(':').pop();

    const cacheHit = await sidetree.db.read(`element:sidetree:did:elem:${didUniqueSuffix}`);
    // A record has two keys:
    // - lastTransaction: the last known ethereum transaction for this DID.
    // - doc: contains the did document associated with the did at the time of lastTransaction
    const cachedRecord = cacheHit && cacheHit.record ? cacheHit.record : {};
    console.log(Object.keys(cachedRecord));
    console.log(cachedRecord.lastResolvedTransactionTime);
    // Only get transactions after transactionTime to avoid reprocessing the cached information
    let transactionTime;
    if (cachedRecord.lastResolvedTransactionTime) {
      transactionTime = cachedRecord.lastResolvedTransactionTime;
    } else if (cachedRecord.lastTransaction) {
      transactionTime = 0;
    } else {
      transactionTime = 0;
    }
    console.log(transactionTime);
    const transactions = await sidetree.getTransactions({
      transactionTime: transactionTime + 1,
      omitTimestamp: true,
    });
    console.log(transactions);

    // No new transactions, we can skip everything else
    if (transactions.length === 0) {
      console.log(cachedRecord);
      return cachedRecord.doc;
    }

    let items = transactions
      .map(transaction => ({ transaction }))
      .map(async item => ({
        ...item,
        anchorFile: await sidetree.getAnchorFile(item.transaction.anchorFileHash),
      }));
    items = await Promise.all(items);

    items = items.filter(item => Boolean(item.anchorFile));

    items = items.filter((item) => {
      if (item.anchorFile.didUniqueSuffixes) {
        return item.anchorFile.didUniqueSuffixes.includes(didUniqueSuffix);
      }
      return true;
    });

    items = await Promise.all(
      items.map(async item => ({
        ...item,
        batchFile: await sidetree.getBatchFile(item.anchorFile.batchFileHash),
      })),
    );
    items = items.filter(item => Boolean(item.batchFile));

    items = items.map(item => ({
      ...item,
      batchFileOperations: batchFileToOperations(item.batchFile),
    }));

    // todo: better types here..
    // flattened.
    items = [].concat(
      ...items.map(item => item.batchFileOperations.map(operation => ({
        operation,
        transaction: item.transaction,
      }))),
    );

    // TODO: Do that before
    // unlike sync, resolve will not have state for other didUniqueSuffix,
    // they cannot be processed here.
    items = items.filter(
      item => item.operation.operationHash === didUniqueSuffix
        || item.operation.decodedOperationPayload.didUniqueSuffix === didUniqueSuffix,
    );

    // Attach transactionTimestamp to the transactionObject so that it can be used in the UI
    items = await Promise.all(
      items.map(async item => ({
        ...item,
        transaction: {
          ...item.transaction,
          transactionTimestamp: (await sidetree.blockchain.getBlockchainTime(
            item.transaction.transactionTime,
          )).timestamp,
        },
      })),
    );

    let updatedState;
    if (Object.keys(cachedRecord).length === 0) {
      updatedState = {};
    } else {
      updatedState = {
        [didUniqueSuffix]: cachedRecord,
      };
    }
    console.log('items', items.length);
    // eslint-disable-next-line
    for (const anchoredOperation of items) {
      // eslint-disable-next-line
      updatedState = await reducer(updatedState, anchoredOperation, sidetree);
    }

    const record = updatedState[didUniqueSuffix];
    const lastResolvedTransaction = transactions.pop();
    const lastResolvedTransactionTime = lastResolvedTransaction.transactionTime;
    console.log(lastResolvedTransactionTime);

    if (record) {
      await sidetree.db.write(`element:sidetree:did:elem:${didUniqueSuffix}`, {
        type: 'element:sidetree:did:documentRecord',
        record: {
          ...record,
          lastResolvedTransactionTime,
        },
      });

      return record.doc;
    }

    return null;
  };
};
