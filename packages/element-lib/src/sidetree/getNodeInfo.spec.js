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
    expect(info.ethereum).toEqual({
      anchor_contract_address: '0x7C922E2DF8A55F3C27D67AC2cdCcE2fb0BBE8b7B',
      accounts: ['0x1E228837561e32a6eC1b16f0574D6A493Edc8863'],
    });
    expect(info.sidetree).toEqual({
      BATCH_INTERVAL_SECONDS: 3,
      BAD_STORAGE_HASH_DELAY_SECONDS: 600,
      VERBOSITY: 0,
    });
  });
});
