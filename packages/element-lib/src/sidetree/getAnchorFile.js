const moment = require('moment');
const schema = require('../schema');

module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.getAnchorFile = async anchorFileHash => {
    const maybeCache = await sidetree.db.read(`element:sidetree:anchorFile:${anchorFileHash}`);
    if (
      maybeCache
      && maybeCache.consideredUnresolvableUntil
      && !moment().isAfter(maybeCache.consideredUnresolvableUntil)
    ) {
      return null;
    }
    if (maybeCache && maybeCache.batchFileHash) {
      return maybeCache;
    }
    let anchorFile = null;
    try {
      anchorFile = await sidetree.storage.read(anchorFileHash);
      const isValid = schema.validator.isValid(anchorFile, schema.schemas.sidetreeAnchorFile);
      if (!isValid) {
        throw new Error('anchorFile is not valid json schema');
      }
      await sidetree.db.write(`element:sidetree:anchorFile:${anchorFileHash}`, {
        type: 'element:sidetree:anchorFile',
        ...anchorFile,
      });
    } catch (e) {
      sidetree.serviceBus.emit('element:sidetree:error:badAnchorFileHash', {
        anchorFileHash,
      });
    }
    return anchorFile;
  };
};
