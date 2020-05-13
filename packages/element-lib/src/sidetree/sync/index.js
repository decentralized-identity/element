const {
  executeSequentially,
  readThenWriteToCache,
  batchFileToOperations,
  getDidUniqueSuffix,
} = require('../../func');
const {
  isTransactionValid,
  isBatchFileValid,
  isAnchorFileValid,
} = require('../utils/validation');

const syncTransaction = sidetree => async (
  transaction,
  onlyDidUniqueSuffix = null
) => {
  sidetree.logger.debug(`sync ${transaction.transactionNumber}`);
  try {
    isTransactionValid(transaction);
    const anchorFile = await readThenWriteToCache(
      sidetree,
      transaction.anchorFileHash
    );
    isAnchorFileValid(anchorFile);
    // Only sync the batch files containing operations about that didUniqueSuffix if provided
    if (
      onlyDidUniqueSuffix &&
      !anchorFile.didUniqueSuffixes.includes(onlyDidUniqueSuffix)
    ) {
      return null;
    }
    const batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
    isBatchFileValid(batchFile);
    const operations = batchFileToOperations(batchFile);
    const [
      transactionWithTimestamp,
    ] = await sidetree.blockchain.extendSidetreeTransactionWithTimestamp([
      transaction,
    ]);
    const operationsByDidUniqueSuffixes = operations.map(operation => {
      const didUniqueSuffix = getDidUniqueSuffix(operation.decodedOperation);
      return {
        type: didUniqueSuffix,
        didUniqueSuffix,
        transaction: transactionWithTimestamp,
        operation,
      };
    });
    const filteredOperationByDidUniqueSuffixes = operationsByDidUniqueSuffixes
      // Only keep operations related to the didUniqueSuffix if provided
      .filter(
        op => !onlyDidUniqueSuffix || op.didUniqueSuffix === onlyDidUniqueSuffix
      );
    const writeOperationToCache = op => {
      const operationId = `operation:${op.operation.operationHash}${
        op.transaction.transactionTime
      }`;
      return sidetree.db.write(operationId, op);
    };
    return executeSequentially(
      writeOperationToCache,
      filteredOperationByDidUniqueSuffixes
    ).then(() => {
      if (
        operationsByDidUniqueSuffixes.length !==
        filteredOperationByDidUniqueSuffixes.length
      ) {
        return null;
      }
      return sidetree.db.write(`transaction:${transaction.transactionNumber}`, {
        type: 'transaction',
        ...transaction,
      });
    });
  } catch (error) {
    // https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
    const stringifiedError = JSON.stringify(
      error,
      Object.getOwnPropertyNames(error)
    );
    sidetree.logger.warn(stringifiedError);
    return sidetree.db.write(`transaction:${transaction.transactionNumber}`, {
      type: 'transaction',
      ...transaction,
      error: stringifiedError,
    });
  }
};

const getFirstUnprocessedBlockNumber = transactionsAlreadyProcessed => {
  const firstUnprocessedTransaction = transactionsAlreadyProcessed
    .sort((t1, t2) => t1.transactionNumber - t2.transactionNumber)
    .reduce(
      (acc, t) => {
        if (t.transactionNumber === acc.transactionNumber + 1) {
          return t;
        }
        return acc;
      },
      { transactionNumber: -1, transactionTime: 0 }
    );
  return firstUnprocessedTransaction.transactionTime;
};

// If a onlyDidSuffix argument is specified, only sync the operations of that suffix
const sync = sidetree => async (onlyDidUniqueSuffix = null) => {
  // Get a set of transactions that have only been processed from cache
  const transactionsAlreadyProcessed = await sidetree.db.readCollection(
    'transaction'
  );
  const processedSet = new Set(
    transactionsAlreadyProcessed.map(t => t.transactionNumber)
  );
  // Get all transactions from the smart contract
  const firstUnprocessedBlock = getFirstUnprocessedBlockNumber(
    transactionsAlreadyProcessed
  );
  let checkpoint = 0;
  if (onlyDidUniqueSuffix) {
    checkpoint = await sidetree.db.read(`checkpoint:${onlyDidUniqueSuffix}`);
    checkpoint = checkpoint ? checkpoint.transactionTime : 0;
    checkpoint = checkpoint || 0;
  }
  const fromBlock = Math.max(firstUnprocessedBlock, checkpoint + 1);
  const transactions = await sidetree.blockchain.getTransactions(
    fromBlock,
    'latest',
    { omitTimestamp: true }
  );
  const transactionQueue = transactions
    // Only process transactions that haven't been processed
    .filter(transaction => !processedSet.has(transaction.transactionNumber));
  await executeSequentially(
    t => sidetree.syncTransaction(t, onlyDidUniqueSuffix),
    transactionQueue
  );
  if (onlyDidUniqueSuffix && transactionQueue.length > 0) {
    const { transactionTime } = transactionQueue.pop();
    await sidetree.db.write(`checkpoint:${onlyDidUniqueSuffix}`, {
      transactionTime,
    });
  }
};

const mapSyncTransaction = sidetree => async transaction => {
  try {
    isTransactionValid(transaction);
    const anchorFile = await readThenWriteToCache(
      sidetree,
      transaction.anchorFileHash
    );
    isAnchorFileValid(anchorFile);
    const { transactionNumber } = transaction;
    await executeSequentially(uniqueSuffix => {
      return sidetree.db.write(
        `transaction:${transactionNumber}:${uniqueSuffix}`,
        {
          type: `transactions:${uniqueSuffix}`,
          transaction,
        }
      );
    }, anchorFile.didUniqueSuffixes);
  } catch (e) {
    sidetree.logger.error(e.message);
  }
};

const mapSync = sidetree => async () => {
  const lastSyncedBlock = await sidetree.db.read('mapSyncLastBlock');
  const startBlock = Number(
    (lastSyncedBlock && lastSyncedBlock.transactionTime) ||
      sidetree.blockchain.startBlock
  );
  sidetree.logger.info(`map sync starting at ${startBlock}`);
  const maxNumberOfBlocksPerSync =
    sidetree.parameters.maxNumberOfBlocksPerSync || 100;
  const blockchainHeight = await sidetree.blockchain.getBlockchainHeight();
  let endBlock = Number(startBlock) + maxNumberOfBlocksPerSync;
  endBlock = Math.min(endBlock, blockchainHeight);
  const transactions = await sidetree.blockchain.getTransactions(
    startBlock,
    endBlock,
    { omitTimestamp: true }
  );
  sidetree.logger.info(`found ${transactions.length} transactions`);
  await executeSequentially(t => sidetree.mapSyncTransaction(t), transactions);
  await sidetree.db.write('mapSyncLastBlock', {
    transactionTime: endBlock,
  });
  sidetree.logger.info(`map synced up to ${endBlock}`);
};

module.exports = { syncTransaction, sync, mapSync, mapSyncTransaction };
