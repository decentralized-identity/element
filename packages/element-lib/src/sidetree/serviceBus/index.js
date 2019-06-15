module.exports = (sidetree) => {
  require('./transaction')(sidetree);
  require('./anchorFile')(sidetree);
  require('./batchFile')(sidetree);
  require('./downloadAnchorFile')(sidetree);
  require('./downloadBatchFile')(sidetree);
  require('./processBatchFile')(sidetree);
  require('./operation')(sidetree);
  require('./cacheDidDocument')(sidetree);

  require('./badAnchorFileHash')(sidetree);
  require('./badBatchFileHash')(sidetree);
  require('./badOperation')(sidetree);
};
