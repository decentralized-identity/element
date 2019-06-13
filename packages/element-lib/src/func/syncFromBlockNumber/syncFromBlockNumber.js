const _ = require('lodash');

const syncTransactionStream = require('./syncTransactionStream');
const syncAnchorFileStream = require('./syncAnchorFileStream');
const syncBatchFileStream = require('./syncBatchFileStream');

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

  let stream = [];

  stream = await syncTransactionStream({
    transactionTime,
    blockchain,
    stream,
    db,
    serviceBus,
  });

  // broken...
  stream = await syncAnchorFileStream({
    stream,
    storage,
    db,
    serviceBus,
  });

  if (didUniqueSuffixes) {
    // eslint-disable-next-line
    stream = stream.filter(
      s => _.intersection(s.anchorFile.didUniqueSuffixes, didUniqueSuffixes).length !== 0,
    );
  }

  stream = await syncBatchFileStream({
    stream,
    storage,
    db,
    serviceBus,
  });

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
