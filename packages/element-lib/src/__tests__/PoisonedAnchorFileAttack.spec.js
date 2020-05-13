const {
  didMethodName,
  getTestSideTree,
  generateActors,
  getActorByIndex,
} = require('./test-utils');

jest.setTimeout(20 * 1000);

let sidetree;
let actor;

beforeAll(async () => {
  sidetree = getTestSideTree();
  sidetree.parameters.mapSync = false;
  await sidetree.db.deleteDB();
  await generateActors(sidetree, 1);
  actor = await getActorByIndex(0);
  await sidetree.batchScheduler.writeNow(actor.createPayload);
});

describe('Poisoned Anchor File Attack', () => {
  it('survives small poison', async () => {
    // Insert poison
    const poisonedTransaction = await sidetree.blockchain.write(
      'QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43'
    );
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`${didMethodName}:${actor.didUniqueSuffix}`);

    const transactions = await sidetree.db.readCollection('transaction');
    const lastCachedTransaction = transactions.pop();
    // Cached transaction is the same as poisoned transaction
    expect(lastCachedTransaction.transactionHash).toBe(
      poisonedTransaction.transactionHash
    );
    expect(lastCachedTransaction.error).toBeDefined();
    expect(lastCachedTransaction.error).toContain('Error: Invalid JSON');
  });

  it('skips poison after it is discovered', async () => {
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`${didMethodName}:${actor.didUniqueSuffix}`);
    const record = await sidetree.db.read(
      'QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43'
    );
    // FIXME
    // expect(record.consideredUnresolvableUntil).toBeDefined();
    expect(record).toBe(null);
  });
});
