const batchFileToOperations = require('../batchFileToOperations');

module.exports = async ({ stream, sidetree }) => {
  let hasProcessedBad = false;
  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];

    try {
      if (!item.batchFile) {
        // eslint-disable-next-line
        item.batchFile = await sidetree.getBatchFile(item.anchorFile.batchFileHash);
      }
    } catch (e) {
      // console.warn(e);
      item.batchFile = null;
      hasProcessedBad = true;
    }
  }

  if (hasProcessedBad) {
    // move this to the get command.
    sidetree.serviceBus.emit('element:sidetree:error', {
      error: 'Removing Sidetree Transactions with bad batchFiles...cache update opportunity.',
    });
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
