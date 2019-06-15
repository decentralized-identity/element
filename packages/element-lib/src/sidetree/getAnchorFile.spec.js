const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;
// eslint-disable-next-line
let anchorFileHash;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getAnchorFile');
  await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );

  const txn = await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.updateRecoveryKey(
      'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      fixtures.recoveryKeypair2,
      fixtures.primaryKeypair2,
      fixtures.recoveryKeypair,
    ),
  );

  ({ anchorFileHash } = txn);
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.getAnchorFile', () => {
  it('should return an anchorFile for a valid hash', async () => {
    const anchorFile = await sidetree.getAnchorFile(anchorFileHash);
    expect(anchorFile.batchFileHash).toBe('QmbwYyGmMitBp39R2PqyaLxwuQRvAzbLJSW8K97ZwhCqBb');
  });

  it('should pull from cache after first load.', async () => {
    await sidetree.sleep(1);
    const anchorFile = await sidetree.getAnchorFile(anchorFileHash);
    // eslint-disable-next-line
    expect(anchorFile._rev).toBeDefined();
  });
});
