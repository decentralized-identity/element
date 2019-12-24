const {
  generateActors,
  getActorByIndex,
} = require('./__fixtures__/sidetreeTestUtils');

const { getTestSideTree } = require('./test-utils');

jest.setTimeout(10 * 1000);

let sidetree;
let actor;

beforeAll(async () => {
  sidetree = getTestSideTree();
  await generateActors(1);
  actor = await getActorByIndex(0);
  await sidetree.batchScheduler.writeNow(actor.createPayload);
});

describe('Poisoned Anchor File Attack', () => {
  it('survives small poison', async () => {
    // Insert poison
    const poisonedTransaction = await sidetree.blockchain.write('QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43');
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`did:elem:${actor.didUniqueSuffix}`);

    const cachedTransaction = await sidetree.db.read(`transaction:${poisonedTransaction.transactionNumber}`);
    expect(cachedTransaction.error).toBeDefined();
    expect(cachedTransaction.error).toContain('Error: Invalid JSON');
  });

  it('skips poison after it is discovered', async () => {
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`did:elem:${actor.didUniqueSuffix}`);
    const record = await sidetree.db.read('QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43');
    // FIXME
    // expect(record.consideredUnresolvableUntil).toBeDefined();
    expect(record).toBe(null);
  });
});
