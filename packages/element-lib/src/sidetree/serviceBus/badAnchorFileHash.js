// const schema = require('.././../schema');
const moment = require('moment');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:error:badAnchorFileHash', async ({ anchorFileHash }) => {
    try {
      await sidetree.db.write(`element:sidetree:anchorFile:${anchorFileHash}`, {
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
