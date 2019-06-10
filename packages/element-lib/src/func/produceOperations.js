const _ = require('lodash');
const batchFileToOperations = require('./batchFileToOperations');

const produceOperations = async ({
  didUniqueSuffixes,
  fromTransactionTime,
  toTransactionTime,
  bus,
  blockchain,
  storage,
}) => {
  const txns = await blockchain.getTransactions(fromTransactionTime, toTransactionTime);

  bus.on('element:sidetree:txn', async (txn) => {
    try {
      const anchorFile = await storage.read(txn.anchorFileHash);
      // TODO: json schema validation here.
      if (
        didUniqueSuffixes
        && _.intersection(anchorFile.didUniqueSuffixes, didUniqueSuffixes).length === 0
      ) {
        return;
      }
      bus.emit('element:sidetree:anchorFile', {
        txn,
        anchorFile,
      });
    } catch (e) {
      console.warn('error processing txn:', txn);
    }
  });

  bus.on('element:sidetree:anchorFile', async ({ txn, anchorFile }) => {
    try {
      const batchFile = await storage.read(anchorFile.batchFileHash);
      // TODO: json schema validation here.
      bus.emit('element:sidetree:batchFile', {
        txn,
        anchorFile,
        batchFile,
      });
    } catch (e) {
      console.warn('error processing anchorFile:', anchorFile);
    }
  });

  bus.on('element:sidetree:batchFile', async ({ txn, anchorFile, batchFile }) => {
    // here we can validate the batchFile
    // -- check its size / etc...
    const operations = batchFileToOperations(batchFile);
    // here we wish we could validate operations,
    // so that the reducer never handled bad data.
    // in order to do so we need state.
    // TODO: json schema validation here.
    bus.emit('element:sidetree:operations', {
      txn,
      anchorFile,
      batchFile,
      operations,
    });
  });

  txns.map(txn => bus.emit('element:sidetree:txn', txn));
};

module.exports = produceOperations;
