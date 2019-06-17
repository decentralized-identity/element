const { sidetree, getSidetree } = require('./sidetree');

jest.setTimeout(20 * 1000);

beforeAll(async () => {
  await getSidetree();
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree', () => {
  it('service is testable', async () => {
    await sidetree.sleep(1);
  });

  it('can resolve', async () => {
    const didDoc = await sidetree.resolve('did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY');
    expect(didDoc.id).toBe('did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY');
  });
});
