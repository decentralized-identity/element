module.exports = async ({
  stream, storage, db, serviceBus,
}) => {
  let hasProcessedBad = false;

  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];
    try {
      if (db) {
        try {
          // eslint-disable-next-line
          let docs = await db.read(
            `element:sidetree:anchorFile:${item.transaction.anchorFileHash}`,
          );
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
    // eslint-disable-next-line
    stream = stream.filter(s => s.anchorFile !== null);
  }

  return stream;
};
