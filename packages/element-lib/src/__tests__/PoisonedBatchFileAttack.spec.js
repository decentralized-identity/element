jest.setTimeout(20 * 1000);

const {
  didMethodName,
  getTestSideTree,
  generateActors,
  getActorByIndex,
} = require('./test-utils');

let sidetree;
let actor;
let txn;
const wrongBatchFileHash = 'QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43';

beforeAll(async () => {
  sidetree = getTestSideTree();
  sidetree.parameters.mapSync = false;
  await sidetree.db.deleteDB();
  await generateActors(sidetree, 1);
  actor = await getActorByIndex(0);
  txn = await sidetree.batchScheduler.writeNow(actor.createPayload);
});

// Seeing intermitent failure here, when running tests on an existing setup.
describe('Poisoned Batch File Attack', () => {
  it('survives small poison', async () => {
    // Insert poison
    const anchorFile = await sidetree.storage.read(txn.anchorFileHash);
    // batchFile will not be valid JSON.
    anchorFile.batchFileHash = wrongBatchFileHash;
    const brokenAnchorFileHash = await sidetree.storage.write(anchorFile);
    // Insert poison
    const poisonedTransaction = await sidetree.blockchain.write(
      brokenAnchorFileHash
    );
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);

    expect(didDoc.id).toBe(`${didMethodName}:${actor.didUniqueSuffix}`);
    const transactions = await sidetree.db.readCollection('transaction');
    const lastCachedTransaction = transactions.pop();
    // Cached transaction is the same as poisoned transaction
    // console.log(lastCachedTransaction)
    expect(lastCachedTransaction.transactionHash).toBe(
      poisonedTransaction.transactionHash
    );
    expect(lastCachedTransaction.error).toBeDefined();
    expect(lastCachedTransaction.error).toContain('Error: Invalid JSON');
  });

  it('skips poison after it is discovered', async () => {
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`${didMethodName}:${actor.didUniqueSuffix}`);
    const record = await sidetree.db.read(wrongBatchFileHash);
    // FIXME
    // expect(record.consideredUnresolvableUntil).toBeDefined();
    expect(record).toBe(null);
  });
});
