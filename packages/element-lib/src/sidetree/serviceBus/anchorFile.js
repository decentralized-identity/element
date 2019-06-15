const schema = require('.././../schema');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:anchorFile', async ({ anchorFileHash, anchorFile }) => {
    try {
      await sidetree.db.write(`element:sidetree:anchorFile:${anchorFileHash}`, {
        type: 'element:sidetree:anchorFile',
        ...anchorFile,
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
