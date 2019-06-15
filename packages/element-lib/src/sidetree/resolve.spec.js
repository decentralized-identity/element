const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getTransactions');
  await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.resolve', () => {
  it('can resolve a specific did', async () => {
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('can resolve a specific did from cache', async () => {
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('can resolve a specific did with new updates & cache', async () => {
    await sidetree.createTransactionFromRequests(
      fixtures.operationGenerator.updateRecoveryKey(
        'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
        fixtures.recoveryKeypair2,
        fixtures.primaryKeypair2,
        fixtures.recoveryKeypair,
      ),
    );
    // expire cache
    await sidetree.sleep(5);

    let didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.publicKey[0].publicKeyHex).toBe(fixtures.primaryKeypair2.publicKey);

    didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.publicKey[0].publicKeyHex).toBe(fixtures.primaryKeypair2.publicKey);
  });

  it('can resolve all dids', async () => {
    const tree = await sidetree.resolve();
    expect(Object.keys(tree)).toEqual([
      'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      'transactionTime',
    ]);

    expect(
      tree['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[0].publicKeyHex,
    ).toEqual(fixtures.primaryKeypair2.publicKey);
  });
});
