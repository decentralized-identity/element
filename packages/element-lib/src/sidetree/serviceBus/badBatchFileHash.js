// const schema = require('.././../schema');
const moment = require('moment');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:error:badBatchFileHash', async ({ batchFileHash }) => {
    try {
      await sidetree.db.write(`element:sidetree:batchFile:${batchFileHash}`, {
        // eslint-disable-next-line
        consideredUnresolvableUntil: moment()
          .add(sidetree.config.BAD_STORAGE_HASH_DELAY_SECONDS, 'seconds')
          .toISOString(),
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
