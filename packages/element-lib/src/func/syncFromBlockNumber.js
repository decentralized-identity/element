const _ = require('lodash');

const batchFileToOperations = require('./batchFileToOperations');

module.exports = async ({
  transactionTime,
  initialState,
  didUniqueSuffixes,
  reducer,
  storage,
  blockchain,
  serviceBus,
  db,
}) => {
  // eslint-disable-next-line
  transactionTime = transactionTime || 0;
  // eslint-disable-next-line
  initialState = initialState || {};
  let docs;
  let stream = [];

  if (db) {
    docs = await db.readCollection('element:sidetree:transaction');
    docs = docs.sort((a, b) => (a.transactionTime > b.transactionTime ? 1 : -1));
    if (!docs.length) {
      stream = await blockchain.getTransactions(transactionTime);
    } else {
      stream = docs;
      const lastTransactionTime = stream[stream.length - 1].transactionTime;
      const newTransactions = await blockchain.getTransactions(lastTransactionTime + 1);

      // if (newTransactions.length) {
      //   console.log('there were new transactions.');
      // }

      // eslint-disable-next-line
      stream = [...stream, ...newTransactions].sort((a, b) => a.transactionTime > b.transactionTime ? 1 : -1,);
    }
  } else {
    stream = await blockchain.getTransactions(transactionTime);
  }

  stream = stream.map(s => ({
    transaction: s,
  }));

  stream = stream.filter(s => s.transaction.failing === undefined);

  if (serviceBus) {
    stream.map(s => serviceBus.emit('element:sidetree:transaction', {
      transaction: s.transaction,
    }));
  }

  let hasProcessedBad = false;

  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];
    try {
      if (db) {
        try {
          // eslint-disable-next-line
          docs = await db.read(`element:sidetree:anchorFile:${item.transaction.anchorFileHash}`);
          if (docs.length) {
            const [record] = docs;
            item.anchorFile = record;
            // console.log('loaded anchorFile from cache.');
          }
        } catch (e) {
          console.error('cache read error', e);
        }
      }
      if (!item.anchorFile) {
        // eslint-disable-next-line
        item.anchorFile = await storage.read(item.transaction.anchorFileHash);
        if (serviceBus && item.anchorFile) {
          serviceBus.emit('element:sidetree:anchorFile', {
            transaction: item.transaction,
            anchorFile: item.anchorFile,
          });
        }
      }
    } catch (e) {
      item.anchorFile = null;
      hasProcessedBad = true;
    }
  }

  if (hasProcessedBad) {
    // mark transaction as bad, so it can be skipped next time.
    const badStreams = stream.filter(s => s.anchorFile === null);
    if (serviceBus) {
      await Promise.all(
        badStreams.map(s => serviceBus.emit('element:sidetree:transaction:failing', {
          transaction: s.transaction,
        })),
      );
    }

    stream = stream.filter(s => s.anchorFile !== null);
  }

  if (didUniqueSuffixes) {
    // eslint-disable-next-line
    stream = stream.filter(
      s => _.intersection(s.anchorFile.didUniqueSuffixes, didUniqueSuffixes).length !== 0,
    );
  }

  hasProcessedBad = false;
  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];

    if (db) {
      try {
        // eslint-disable-next-line
        docs = await db.read(`element:sidetree:batchFile:${item.anchorFile.batchFileHash}`);
        if (docs.length) {
          const [record] = docs;
          item.batchFile = record;
          // console.log('loaded batchFile from cache.');
        }
      } catch (e) {
        console.error('cache read error', e);
      }
    }

    try {
      if (!item.batchFile) {
        // eslint-disable-next-line
        item.batchFile = await storage.read(item.anchorFile.batchFileHash);
        if (serviceBus && item.batchFile) {
          serviceBus.emit('element:sidetree:batchFile', {
            transaction: item.transaction,
            anchorFile: item.anchorFile,
            batchFile: {
              operations: batchFileToOperations(item.batchFile),
            },
          });
        }
      }
    } catch (e) {
      // console.warn(e);
      item.batchFile = null;
      hasProcessedBad = true;
    }
  }

  if (hasProcessedBad) {
    if (serviceBus) {
      serviceBus.emit('element:sidetree:error', {
        error: 'Removing Sidetree Transactions with bad batchFiles...cache update opportunity.',
      });
    }
    stream = stream.filter(s => s.batchFile !== null);
  }

  stream = await Promise.all(
    stream.map(s => ({
      ...s,
      batchFile: {
        operations: batchFileToOperations(s.batchFile),
      },
    })),
  );

  const anchoredOperations = [];

  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const { transaction, anchorFile, batchFile } = stream[txIndex];
    for (let opIndex = 0; opIndex < batchFile.operations.length; opIndex++) {
      const op = batchFile.operations[opIndex];
      anchoredOperations.push({
        ...op,
        transaction,
        anchorFile,
        batchFile,
      });
    }
  }

  let updatedState = { ...initialState };

  // eslint-disable-next-line
  for (const anchoredOperation of anchoredOperations) {
    // eslint-disable-next-line
    updatedState = { ...(await reducer(updatedState, anchoredOperation, serviceBus)) };
  }

  if (stream.length) {
    const lastTxn = stream.pop().transaction;
    updatedState.transactionTime = lastTxn.transactionTime;
  }

  return updatedState;
};
