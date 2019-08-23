const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;
let txn1;
// eslint-disable-next-line
let txn2;
let txns;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getTransactions');

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

describe('sidetree.getTransactions', () => {
  it('should return transactions', async () => {
    txns = await sidetree.getTransactions();
    expect(txns.length).toBe(2);
  });

  it('should return transactions count', async () => {
    txns = await sidetree.getTransactions({
      since: 0,
      count: 1,
    });
    expect(txns.length).toBe(2);

    txns = await sidetree.getTransactions({
      since: 1,
      count: 1,
    });
    expect(txns.length).toBe(1);
  });

  it('should return transactions since', async () => {
    txns = await sidetree.getTransactions({
      since: 0,
    });
    expect(txns.length).toBe(2);
    txns = await sidetree.getTransactions({
      since: 1,
    });
    expect(txns.length).toBe(1);
  });

  it('should return transactions cacheOnly', async () => {
    await sidetree.sleep(1);
    txns = await sidetree.getTransactions({
      cacheOnly: true,
    });
    // eslint-disable-next-line
    expect(txns[0]._rev).toBeDefined();
  });

  it('should return transactions transactionTimeHash', async () => {
    txns = await sidetree.getTransactions({
      transactionTimeHash: txn1.transactionTimeHash,
    });
    expect(txns.length).toBe(2);
    txns = await sidetree.getTransactions({
      transactionTimeHash: txn2.transactionTimeHash,
    });
    expect(txns.length).toBe(1);
  });
});
