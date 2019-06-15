const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;
// eslint-disable-next-line
let anchorFile;
// eslint-disable-next-line
let batchFileHash;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getBatchFile');
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

  const { anchorFileHash } = txn;
  anchorFile = await sidetree.getAnchorFile(anchorFileHash);
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.getBatchFile', () => {
  it('should return an batchFile for a valid hash', async () => {
    const batchFile = await sidetree.getBatchFile(anchorFile.batchFileHash);
    expect(batchFile.operations.length).toBe(1);
  });

  it('should pull from cache after first load.', async () => {
    await sidetree.sleep(1);
    const batchFile = await sidetree.getBatchFile(anchorFile.batchFileHash);
    // eslint-disable-next-line
    expect(batchFile._rev).toBeDefined();
  });
});
