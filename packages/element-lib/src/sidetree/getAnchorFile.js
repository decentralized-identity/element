module.exports = (sidetree) => {
  // todo... pass sidetree (sidetree instance) to sync instead of db and bus.
  // then use helper methods, like sidetree one.
  //   eslint-disable-next-line
  sidetree.getAnchorFile = async anchorFileHash => {
    const maybeCache = await sidetree.db.read(`element:sidetree:anchorFile:${anchorFileHash}`);
    if (maybeCache.batchFileHash) {
      return maybeCache;
    }
    const anchorFile = await sidetree.storage.read(anchorFileHash);
    // todo: json schema validation here.
    await sidetree.serviceBus.emit('element:sidetree:anchorFile', { anchorFileHash, anchorFile });
    return anchorFile;
  };
};
