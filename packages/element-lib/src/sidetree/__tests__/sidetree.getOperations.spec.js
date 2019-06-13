const getLocalSidetree = require('../../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getOperations');
  await sidetree.saveOperationFromRequestBody(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.getOperations', () => {
  it('should return transactions', async () => {
    // process at least some ops
    await sidetree.resolve();
    await sidetree.sleep(1);
    const ops = await sidetree.getOperations();
    expect(ops.length).toBe(1);
  });
});
