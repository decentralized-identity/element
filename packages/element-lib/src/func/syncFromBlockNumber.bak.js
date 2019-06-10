const nanobus = require('nanobus');

const InMemoryOpStore = require('../operationStore/InMemoryOpStore');

const produceOperations = require('./produceOperations');
const resolveFromOperationStore = require('./resolveFromOperationStore');

const sleep = seconds => new Promise((resolve) => {
  setTimeout(resolve, seconds * 1000);
});
// this needs to go away :(
// we need to rely on op store for resolution, and stop building a full state tree anywhere...
module.exports = async ({
  didUniqueSuffixes, reducer, bus, opStore, storage, blockchain,
}) => {
  console.warn(
    '[DEPRECATION WARNING] syncFromBlockNumber will be removed soon. use resolveFromOperationStore and produceOperations instead.',
  );
  const txns = await blockchain.getTransactions(0);

  const lastTxn = txns.pop();
  const currentTime = lastTxn.transactionTime;
  // eslint-disable-next-line
  bus = bus || nanobus();
  // eslint-disable-next-line
  opStore = opStore || new InMemoryOpStore();

  bus.on('element:sidetree:operations', (anchoredOperations) => {
    opStore.addOperations(anchoredOperations);
  });

  produceOperations({
    // we need to load all here, because we have no other way of knowing
    // if we are done with all.
    // didUniqueSuffixes,
    fromTransactionTime: 0,
    toTransactionTime: currentTime + 1,
    bus,
    blockchain,
    storage,
  });

  let done = false;

  let model;
  while (!done) {
    // eslint-disable-next-line
    model = await resolveFromOperationStore(opStore, reducer);
    // eslint-disable-next-line
    await sleep(1);

    if (model && model.transactionTime >= currentTime) {
      done = true;
    }
  }

  if (didUniqueSuffixes) {
    // eslint-disable-next-line
    for (let key of Object.keys(model)) {
      if (key !== 'transactionTime' && !didUniqueSuffixes.includes(key)) {
        delete model[key];
      }
    }
  }

  return model;
};
