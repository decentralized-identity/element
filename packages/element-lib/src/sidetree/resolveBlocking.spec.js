const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(20 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.resolveBlocking');
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.resolveBlocking', () => {
  beforeAll(async () => {
    await sidetree.createTransactionFromRequests(
      fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
    );
  });
  // 1600ms lag time...
  it('on first resolve', async () => {
    const didDoc = await sidetree.resolveBlocking(
      'did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
    );
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    // assert db records
  });

  it('on second resolve', async () => {
    // assert cache hit.
    const didDoc = await sidetree.resolveBlocking(
      'did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
    );
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });
});
