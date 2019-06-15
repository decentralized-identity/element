const moment = require('moment');
const syncFromBlockNumber = require('./syncFromBlockNumber');

const reducer = require('../reducer');

module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.resolve = async did => {
    const syncArgs = {
      transactionTime: 0,
      initialState: {},
      reducer,
      sidetree,
    };

    if (!did) {
      return syncFromBlockNumber(syncArgs);
    }

    // TODO: add back.. for path parsing..
    // const resolver = require('did-resolver');
    const uid = did.split(':').pop();

    // make this a method like getAnchorFile.
    const docs = await sidetree.db.read(`element:sidetree:did:elem:${uid}`);

    // did document cache hit
    if (docs.length) {
      const [record] = docs;
      if (!moment().isAfter(record.expires)) {
        return docs[0].doc;
      }
      //  catch expiration
    }
    // did document cache miss / expired
    // check for updates blocking on cache miss.
    const model = await syncFromBlockNumber({
      ...syncArgs,
      didUniqueSuffixes: [uid],
    });

    if (model[uid]) {
      // sidetree.serviceBus.emit(`element:sidetree:did:elem:${uid}`, {
      //   uid,
      //   record: model[uid],
      // });
      return model[uid].doc;
    }
    return null;
  };
};
