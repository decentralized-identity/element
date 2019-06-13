const getLocalSidetree = require('../../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getTransactions');
  await sidetree.saveOperationFromRequestBody(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.getTransactions', () => {
  it('should return transactions', async () => {
    const txns = await sidetree.getTransactions();
    expect(txns.length).toBe(1);
  });
});
