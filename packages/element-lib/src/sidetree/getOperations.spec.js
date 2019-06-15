const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getOperations');
  await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );

  await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.updateRecoveryKey(
      'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      fixtures.recoveryKeypair2,
      fixtures.primaryKeypair2,
      fixtures.recoveryKeypair,
    ),
  );

  await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.createDID(fixtures.recoveryKeypair, fixtures.recoveryKeypair2),
  );
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.getOperations', () => {
  it('should return operations', async () => {
    // process at least some ops
    await sidetree.resolve();
    await sidetree.sleep(1);
    const ops = await sidetree.getOperations();
    expect(ops.length).toBe(3);
    const someOps = await sidetree.getOperations('MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(someOps.length).toBe(2);
  });

  it('can resolve did from operations', async () => {
    await sidetree.sleep(1);
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });
});
