const base64url = require('base64url');
const crypto = require('crypto');
const _ = require('lodash');

module.exports = async ({
  transactionTime, initialState, reducer, storage, blockchain, onUpdated,
}) => {
  
  let stream = await blockchain.getTransactions(transactionTime);

  stream = await Promise.all(
    stream.map(async txn => ({
      transaction: txn,
      anchorFile: await storage.read(txn.anchorFileHash),
    })),
  );

  stream = await Promise.all(
    stream.map(async s => ({
      ...s,
      batchFile: await storage.read(s.anchorFile.batchFileHash),
    })),
  );

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
    updatedState.transactionTime = stream.pop().transaction.transactionTime;
  }

  if (onUpdated) {
    onUpdated(updatedState);
  }

  return updatedState;
};
