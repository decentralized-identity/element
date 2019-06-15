// const schema = require('.././../schema');
const moment = require('moment');

module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:did:elem', async ({ uid, record }) => {
    try {
      console.log({ uid, record });
      await sidetree.db.write(`element:sidetree:did:elem:${uid}`, {
        record,
        expires: moment()
          .add(sidetree.config.CACHE_EXPIRES_SECONDS, 'seconds')
          .toISOString(),
      });
    } catch (e) {
      if (e.status === 409) {
        // Document update conflict
        // Meaning we already have this operation.
        // No OP
      } else {
        console.warn(e);
      }
    }
  });
};
