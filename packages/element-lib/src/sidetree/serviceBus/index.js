module.exports = (sidetree) => {
  require('./transaction')(sidetree);
  require('./downloadAnchorFile')(sidetree);
  require('./downloadBatchFile')(sidetree);
  require('./processBatchFile')(sidetree);
  require('./operation')(sidetree);
  require('./cacheDidDocument')(sidetree);

  sidetree.serviceBus.on('element:sidetree:error', async ({ error, details }) => {
    if (sidetree.config.VERBOSITY > 0) {
      console.warn('Sidetree Error', error);
      console.warn('Details: ', details);
    }
  });

  sidetree.serviceBus.on('element:sidetree:transaction:failing', async ({ transaction }) => {
    try {
      await sidetree.db.write(`element:sidetree:transaction:${transaction.transactionTimeHash}`, {
        // eslint-disable-next-line
        ...transaction,
        failing: true,
      });
    } catch (e) {
      if (e.status === 409) {
        // Document update conflict
        // Meaning we already have sidetree operation.
        // No OP
      } else {
        console.warn(e);
      }
    }
  });

  sidetree.serviceBus.on('element:sidetree:anchorFile', async ({ anchorFileHash, anchorFile }) => {
    try {
      await sidetree.db.write(`element:sidetree:anchorFile:${anchorFileHash}`, {
        type: 'element:sidetree:anchorFile',
        ...anchorFile,
      });
    } catch (e) {
      if (e.status === 409) {
        // Document update conflict
        // Meaning we already have sidetree operation.
        // No OP
      } else {
        console.warn(e);
      }
    }
  });

  sidetree.serviceBus.on('element:sidetree:batchFile', async ({ batchFileHash, batchFile }) => {
    try {
      await sidetree.db.write(`element:sidetree:batchFile:${batchFileHash}`, {
        type: 'element:sidetree:batchFile',
        ...batchFile,
      });
    } catch (e) {
      if (e.status === 409) {
        // Document update conflict
        // Meaning we already have sidetree operation.
        // No OP
      } else {
        console.warn(e);
      }
    }
    // migth as well save operations here too
    // try {
    //   const operations = batchFileToOperations(batchFile);
    //   await Promise.all(
    //     operations.map(async (operation) => {
    //       const anchorFile = await sidetree.db.getAnchorFileFromBatchFileHash(batchFileHash);
    //       const transaction = await sidetree.db.getTransactionFromAnchorFileHash(
    //         // eslint-disable-next-line
    //         anchorFile._id.split(':').pop(),
    //       );
    //       const expandedOp = {
    //         type: 'element:sidetree:operation',
    //         transaction,
    //         anchorFile,
    //         ...operation,
    //       };

    //       const record = sidetree.db.write(
    //         `element:sidetree:operation:${operation.operationHash}`,
    //         expandedOp,
    //       );
    //       return record;
    //     }),
    //   );
    // } catch (e) {
    //   if (e.status === 409) {
    //     // Document update conflict
    //     // Meaning we already have sidetree operation.
    //     // No OP
    //   } else {
    //     console.warn(e);
    //   }
    // }
  });
};
