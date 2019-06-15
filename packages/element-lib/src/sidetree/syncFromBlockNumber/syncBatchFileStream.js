const batchFileToOperations = require('../../func/batchFileToOperations');

module.exports = async ({ stream, sidetree }) => {
  for (let txIndex = 0; txIndex < stream.length; txIndex++) {
    const item = stream[txIndex];
    // eslint-disable-next-line
    item.batchFile = await sidetree.getBatchFile(item.anchorFile.batchFileHash);
  }
  //   eslint-disable-next-line
  stream = stream.filter(s => s.batchFile !== null);
  //   eslint-disable-next-line
  stream = await Promise.all(
    stream.map(s => ({
      ...s,
      batchFile: {
        operations: batchFileToOperations(s.batchFile),
      },
    })),
  );

  console.log(stream);
  return stream;
};
