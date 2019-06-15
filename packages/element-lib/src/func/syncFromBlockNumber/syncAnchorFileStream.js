module.exports = async ({ stream, sidetree }) => {
  let hasProcessedBad = false;

  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];
    try {
      if (!item.anchorFile) {
        // eslint-disable-next-line
        item.anchorFile = await sidetree.getAnchorFile(item.transaction.anchorFileHash);
      }
    } catch (e) {
      item.anchorFile = null;
      hasProcessedBad = true;
    }
  }

  if (hasProcessedBad) {
    // mark transaction as bad, so it can be skipped next time.
    const badStreams = stream.filter(s => s.anchorFile === null);
    // move this to the get command.
    await Promise.all(
      badStreams.map(s => sidetree.serviceBus.emit('element:sidetree:transaction:failing', {
        transaction: s.transaction,
      })),
    );

    // eslint-disable-next-line
    stream = stream.filter(s => s.anchorFile !== null);
  }

  return stream;
};
