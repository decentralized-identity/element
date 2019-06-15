module.exports = async ({ stream, sidetree }) => {
  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];
    // eslint-disable-next-line
    item.anchorFile = await sidetree.getAnchorFile(item.transaction.anchorFileHash);
  }

  // eslint-disable-next-line
  stream = stream.filter(s => s.anchorFile !== null);

  console.log(stream);
  return stream;
};
