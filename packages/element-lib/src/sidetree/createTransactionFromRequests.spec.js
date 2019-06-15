const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;
// eslint-disable-next-line
let txn1;
// eslint-disable-next-line
let txn2;
let txns;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.createTransactionFromRequests');

  txn1 = await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );
  txn2 = await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.updateRecoveryKey(
      'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      fixtures.recoveryKeypair2,
      fixtures.primaryKeypair2,
      fixtures.recoveryKeypair,
    ),
  );
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.createTransactionFromRequests', () => {
  it('should return transactions', async () => {
    txns = await sidetree.getTransactions();
    expect(txns.length).toBe(2);
  });
});
