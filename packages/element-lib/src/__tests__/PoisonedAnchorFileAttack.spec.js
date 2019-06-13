const fixtures = require('../__tests__/__fixtures__');

const getLocalSidetree = require('./__fixtures__/getLocalSidetree');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('PoisonedAnchorFileAttack');
  await sidetree.saveOperationFromRequestBody(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );

  await sidetree.sleep(1);
});

afterAll(async () => {
  await sidetree.close();
});

describe('Poisoned Anchor File Attack', () => {
  it('survives small poison', async (done) => {
    // Insert poison
    await sidetree.blockchain.write('QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43');

    let count = 0;
    sidetree.serviceBus.on('element:sidetree:transaction:failing', () => {
      count++;
      if (count === 1) {
        done();
      }
    });

    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('skips poison after it is discovered', async () => {
    await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });
});
