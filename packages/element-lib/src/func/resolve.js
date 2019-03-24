const resolver = require('did-resolver');
const config = require('../json/config.json');

resolver.registerMethod(config.didMethodName.split(':')[1], async (did, parsed) => {
  const syncFromBlockNumber = require('./syncFromBlockNumber');
  const reducer = require('../reducer');
  const storage = require('../storage');
  const ledger = require('../ledger');
  const cache = require('../cache');
  // {
  //   method: 'mymethod',
  //   id: 'abcdefg',
  //   did: 'did:mymethod:abcdefg/some/path#fragment=123',
  //   path: '/some/path',
  //   fragment: 'fragment=123'
  // }
  const cachedState = cache.getItem('elem.world');
  // todo: get model from cache..
  // use cache to only sync updates...
  const transactionTime = cachedState ? cachedState.transactionTime : 0; // set from cache
  // console.log(transactionTime);
  const updated = await syncFromBlockNumber({
    transactionTime: transactionTime + 1,
    initialState: cachedState || {}, // set from cache
    reducer,
    storage,
    ledger,
  });

  cache.setItem('elem.world', updated);

  const record = updated[parsed.id];
  if (record) {
    return record.doc;
  }

  return null;
});

module.exports = did => resolver.default(did);
