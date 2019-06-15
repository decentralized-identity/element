module.exports = (sidetree) => {
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
  });
};
