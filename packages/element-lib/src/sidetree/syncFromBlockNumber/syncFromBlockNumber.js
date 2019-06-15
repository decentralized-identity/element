const _ = require('lodash');

const syncTransactionStream = require('./syncTransactionStream');
const syncAnchorFileStream = require('./syncAnchorFileStream');
const syncBatchFileStream = require('./syncBatchFileStream');

module.exports = async ({
  transactionTime,
  initialState,
  didUniqueSuffixes,
  reducer,
  sidetree,
}) => {
  if (!didUniqueSuffixes) {
    throw new Error('synching all state is deprecated');
  }
  // eslint-disable-next-line
  transactionTime = transactionTime || 0;
  // eslint-disable-next-line
  initialState = initialState || {};

  let stream = [];

  stream = await syncTransactionStream({
    transactionTime,
    stream,
    sidetree,
  });

  stream = await syncAnchorFileStream({
    stream,
    sidetree,
  });

  if (didUniqueSuffixes) {
    // eslint-disable-next-line
    stream = stream.filter(
      s => _.intersection(s.anchorFile.didUniqueSuffixes, didUniqueSuffixes).length !== 0,
    );
  }

  stream = await syncBatchFileStream({
    stream,
    sidetree,
  });

  const anchoredOperations = [];

  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const { transaction, batchFile } = stream[txIndex];
    for (let opIndex = 0; opIndex < batchFile.operations.length; opIndex++) {
      const op = batchFile.operations[opIndex];
      anchoredOperations.push({
        ...op,
        transaction,
      });
    }
  }

  let updatedState = { ...initialState };

  console.log(anchoredOperations);

  // eslint-disable-next-line
  for (const anchoredOperation of anchoredOperations) {
    // eslint-disable-next-line
    updatedState = { ...(await reducer(updatedState, anchoredOperation, sidetree)) };
  }

  if (stream.length) {
    const lastTxn = stream.pop().transaction;
    updatedState.transactionTime = lastTxn.transactionTime;
  }

  return updatedState;
};
