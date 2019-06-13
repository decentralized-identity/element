const batchFileToOperations = require('../batchFileToOperations');

module.exports = async ({ stream, storage, db, serviceBus }) => {
  let hasProcessedBad = false;
  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];

    if (db) {
      try {
        // eslint-disable-next-line
        let docs = await db.read(`element:sidetree:batchFile:${item.anchorFile.batchFileHash}`);
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
    //   eslint-disable-next-line
    stream = stream.filter(s => s.batchFile !== null);
  }

  //   eslint-disable-next-line
  stream = await Promise.all(
    stream.map(s => ({
      ...s,
      batchFile: {
        operations: batchFileToOperations(s.batchFile),
      },
    })),
  );
  return stream;
};
