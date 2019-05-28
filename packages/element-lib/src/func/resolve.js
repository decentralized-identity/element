const resolver = require('did-resolver');
const config = require('../json/config.json');

const syncFromBlockNumber = require('./syncFromBlockNumber');

const method = config.didMethodName.split(':')[1];

const resolve = ({
  did, reducer, storage, blockchain, transactionTime,
}) => {
  if (
    did === undefined
    || reducer === undefined
    || storage === undefined
    || blockchain === undefined
    || transactionTime === undefined
  ) {
    throw new Error('Invalid args: resolve({ did, reducer, storage, blockchain, transactionTime})');
  }

  resolver.registerMethod(method, async (_did, parsed) => {
    // {
    //   method: 'mymethod',
    //   id: 'abcdefg',
    //   did: 'did:mymethod:abcdefg/some/path#fragment=123',
    //   path: '/some/path',
    //   fragment: 'fragment=123'
    // }
    // console.log(did, parsed);
    // eslint-disable-next-line

    const updated = await syncFromBlockNumber({
      didUniqueSuffixes: [parsed.id],
      transactionTime,
      initialState: {}, // set from cache
      reducer,
      storage,
      blockchain,
    });
    const record = updated[parsed.id];
    if (record) {
      return record.doc;
    }
    return null;
  });

  return resolver.default(did);
};

module.exports = resolve;
