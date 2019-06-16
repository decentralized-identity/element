const moment = require('moment');
const schema = require('../schema');

module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.getBatchFile = async batchFileHash => {
    const maybeCache = await sidetree.db.read(`element:sidetree:batchFile:${batchFileHash}`);
    if (
      maybeCache.consideredUnresolvableUntil
      && !moment().isAfter(maybeCache.consideredUnresolvableUntil)
    ) {
      return null;
    }
    if (maybeCache.operations) {
      return maybeCache;
    }
    let batchFile;
    try {
      batchFile = await sidetree.storage.read(batchFileHash);
      const isValid = schema.validator.isValid(batchFile, schema.schemas.sidetreeBatchFile);
      if (!isValid) {
        throw new Error('batchFile is not valid json schema');
      }

      await sidetree.db.write(`element:sidetree:batchFile:${batchFileHash}`, {
        type: 'element:sidetree:batchFile',
        ...batchFile,
      });
    } catch (e) {
      sidetree.serviceBus.emit('element:sidetree:error:badBatchFileHash', {
        batchFileHash,
      });
    }
    return batchFile;
  };
};
