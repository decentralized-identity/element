const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getBatchFile');
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.getNodeInfo', () => {
  it('should return node info', async () => {
    const info = await sidetree.getNodeInfo();
    expect(info.ipfs.version).toBeDefined();
    expect(info.ipfs.commit).toBeDefined();
    expect(info.ipfs.repo).toBeDefined();

    expect(info.ethereum.anchor_contract_address).toBeDefined();
    expect(info.ethereum.accounts).toBeDefined();
    expect(info.sidetree).toEqual({
      BATCH_INTERVAL_SECONDS: 3,
      BAD_STORAGE_HASH_DELAY_SECONDS: 600,
      VERBOSITY: 0,
    });
  });
});
