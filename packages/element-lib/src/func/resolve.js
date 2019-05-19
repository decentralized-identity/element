const resolver = require('did-resolver');
const config = require('../json/config.json');

const syncFromBlockNumber = require('./syncFromBlockNumber');

const method = config.didMethodName.split(':')[1];

const cacheName = `${method}.resolver.cache`;

const resolve = ({
  did, cache, reducer, storage, blockchain,
}) => {
  if (!did || !cache || !reducer || !storage || !blockchain) {
    throw new Error('Invalid args: resolve({ did, cache, reducer, storage, blockchain})');
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
    const cachedState = cache.getItem(cacheName);
    const transactionTime = cachedState ? cachedState.transactionTime : 0; // set from cache
    const updated = await syncFromBlockNumber({
      didUniqueSuffixes: [parsed.id],
      transactionTime: transactionTime + 1,
      initialState: cachedState || {}, // set from cache
      reducer,
      storage,
      blockchain,
    });
    cache.setItem(cacheName, updated);
    const record = updated[parsed.id];
    if (record) {
      return record.doc;
    }
    return null;
  });

  return resolver.default(did);
};

module.exports = resolve;
