module.exports = (sidetree) => {
  // todo... pass sidetree (sidetree instance) to sync instead of db and bus.
  // then use helper methods, like sidetree one.
  //   eslint-disable-next-line
  sidetree.getBatchFile = async batchFileHash => {
    const maybeCache = await sidetree.db.read(`element:sidetree:batchFile:${batchFileHash}`);
    if (maybeCache.operations) {
      return maybeCache;
    }
    const batchFile = await sidetree.storage.read(batchFileHash);
    // todo: json schema validation here.
    await sidetree.serviceBus.emit('element:sidetree:batchFile', { batchFileHash, batchFile });
    return batchFile;
  };
};
