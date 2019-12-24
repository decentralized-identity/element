const {
  generateActors,
  getActorByIndex,
} = require('./__fixtures__/sidetreeTestUtils');
const { getTestSideTree } = require('./test-utils');

jest.setTimeout(10 * 1000);

let sidetree;
let actor;
let txn;
const wrongBatchFileHash = 'QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43';

beforeAll(async () => {
  sidetree = getTestSideTree();
  await generateActors(1);
  actor = await getActorByIndex(0);
  txn = await sidetree.batchScheduler.writeNow(actor.createPayload);
});

describe('Poisoned Batch File Attack', () => {
  it('survives small poison', async () => {
    // Insert poison
    const anchorFile = await sidetree.storage.read(txn.anchorFileHash);
    // batchFile will not be valid JSON.
    anchorFile.batchFileHash = wrongBatchFileHash;
    const brokenAnchorFileHash = await sidetree.storage.write(anchorFile);
    // Insert poison
    const poisonedTransaction = await sidetree.blockchain.write(brokenAnchorFileHash);
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`did:elem:${actor.didUniqueSuffix}`);

    const cachedTransaction = await sidetree.db.read(`transaction:${poisonedTransaction.transactionNumber}`);
    expect(cachedTransaction.error).toBeDefined();
    expect(cachedTransaction.error).toContain('Error: Invalid JSON');
  });

  it('skips poison after it is discovered', async () => {
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`did:elem:${actor.didUniqueSuffix}`);
    const record = await sidetree.db.read(wrongBatchFileHash);
    // FIXME
    // expect(record.consideredUnresolvableUntil).toBeDefined();
    expect(record).toBe(null);
  });
});
