const moment = require('moment');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:error:badOperation', async ({ operation, reason }) => {
    try {
      console.log(
        'bad operation: ',
        //  operation,
        reason,
      );
      await sidetree.db.write(`element:sidetree:operation:${operation.operationHash}`, {
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
