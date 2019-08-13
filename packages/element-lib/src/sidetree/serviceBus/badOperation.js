const moment = require('moment');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:error:badOperation', async ({ operation }) => {
    try {
      await sidetree.db.write(`element:sidetree:operation:${operation.operation.operationHash}`, {
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
