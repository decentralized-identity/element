const base64url = require('base64url');
const crypto = require('crypto');
const _ = require('lodash');

module.exports = async ({
  didUniqueSuffixes, reducer, storage, blockchain, onUpdated,
}) => {
  console.warn(
    '[DEPRECATION WARNING] syncFromBlockNumber will be removed soon. use resolveFromOperationStore and produceOperations instead.',
  );
  const transactionTime = 0;
  const initialState = {};

  let stream = await blockchain.getTransactions(transactionTime);

  stream = stream.map(s => ({
    transaction: s,
  }));

  let hasProcessedBad = false;
  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];
    try {
      // eslint-disable-next-line
      item.anchorFile = await storage.read(item.transaction.anchorFileHash);
    } catch (e) {
      console.warn(e);
      item.anchorFile = null;
      hasProcessedBad = true;
    }
  }

  if (hasProcessedBad) {
    console.warn('Removing Sidetree Transactions with bad anchorFiles');
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
    try {
      // eslint-disable-next-line
      item.batchFile = await storage.read(item.anchorFile.batchFileHash);
    } catch (e) {
      console.warn(e);
      item.batchFile = null;
      hasProcessedBad = true;
    }
  }

  if (hasProcessedBad) {
    console.warn('Removing Sidetree Transactions with bad batchFiles');
    stream = stream.filter(s => s.batchFile !== null);
  }

  stream = await Promise.all(
    stream.map(s => ({
      ...s,
      batchFile: {
        operations: _.map(s.batchFile.operations, (op) => {
          const operationHash = base64url.encode(
            crypto
              .createHash('sha256')
              .update(base64url.toBuffer(op))
              .digest(),
          );
          const decodedOperation = JSON.parse(base64url.decode(op));
          return {
            operationHash,
            decodedOperation,
            encodedOperation: op,
            decodedOperationPayload: JSON.parse(base64url.decode(decodedOperation.payload)),
          };
        }),
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
      });
    }
  }

  let updatedState = { ...initialState };

  // eslint-disable-next-line
  for (const anchoredOperation of anchoredOperations) {
    // eslint-disable-next-line
    updatedState = { ...(await reducer(updatedState, anchoredOperation)) };
  }

  if (stream.length) {
    const lastTxn = stream.pop().transaction;
    updatedState.transactionTime = lastTxn.transactionTime;
  }

  if (onUpdated) {
    onUpdated(updatedState);
  }

  return updatedState;
};
