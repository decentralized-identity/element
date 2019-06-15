const batchFileToOperations = require('../func/batchFileToOperations');
const reducer = require('../reducer');

module.exports = async (sidetree) => {
  // eslint-disable-next-line
  sidetree.resolveBlocking = async did => {
    let updatedState = {};
    const uid = did.split(':').pop();

    const cachedRecord = await sidetree.db.read(`element:sidetree:did:elem:${uid}`);
    if (cachedRecord.record) {
      updatedState = cachedRecord.record;
    }

    const transactions = await sidetree.blockchain.getTransactions(
      updatedState.lastTransactionTime || 0,
      'latest',
    );

    let items = transactions.map(transaction => ({
      transaction,
    }));

    items = await Promise.all(
      items.map(async item => ({
        ...item,
        anchorFile: await sidetree.getAnchorFile(item.transaction.anchorFileHash),
      })),
    );
    items = items.filter(item => !!item.anchorFile);

    // eslint-disable-next-line
    items = items.filter(item => item.anchorFile.didUniqueSuffixes.includes(uid));

    items = await Promise.all(
      items.map(async item => ({
        ...item,
        batchFile: await sidetree.getBatchFile(item.anchorFile.batchFileHash),
      })),
    );
    items = items.filter(item => !!item.batchFile);

    items = items.map(item => ({
      ...item,
      batchFileOperations: batchFileToOperations(item.batchFile),
    }));

    // todo: better types here..
    // flattened.
    const anchoredOperations = [].concat(
      ...items.map(item => item.batchFileOperations.map(operation => ({
        operation,
        transaction: item.transaction,
      }))),
    );

    // eslint-disable-next-line
    for (const anchoredOperation of anchoredOperations) {
      // eslint-disable-next-line
      updatedState = { ...(await reducer(updatedState, anchoredOperation, sidetree)) };
    }

    const record = updatedState[uid];

    if (record) {
      await sidetree.db.write(`element:sidetree:did:elem:${uid}`, {
        record,
      });

      return updatedState[uid].doc;
    }

    return null;
  };
};
