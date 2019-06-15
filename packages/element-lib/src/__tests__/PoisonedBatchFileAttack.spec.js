const fixtures = require('../__tests__/__fixtures__');

const getLocalSidetree = require('./__fixtures__/getLocalSidetree');

jest.setTimeout(10 * 1000);

let sidetree;
let txn;

beforeAll(async () => {
  sidetree = await getLocalSidetree('PoisonedBatchFileAttack');
  txn = await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );

  await sidetree.sleep(1);
});

afterAll(async () => {
  await sidetree.close();
});

describe('Poisoned Batch File Attack', () => {
  it('survives small poison', async (done) => {
    // Insert poison
    const anchorFile = await sidetree.storage.read(txn.anchorFileHash);
    // batchFile will not be valid JSON.
    anchorFile.batchFileHash = 'QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43';
    const brokenAnchorFileHash = await sidetree.storage.write(anchorFile);
    // Insert poison
    await sidetree.blockchain.write(brokenAnchorFileHash);

    let count = 0;
    sidetree.serviceBus.on('element:sidetree:error:badBatchFileHash', () => {
      count++;
      if (count === 1) {
        done();
      }
    });

    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('skips poison after it is discovered', async () => {
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    const record = await sidetree.db.read(
      'element:sidetree:batchFile:QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43',
    );
    expect(record.consideredUnresolvableUntil).toBeDefined();
  });
});
