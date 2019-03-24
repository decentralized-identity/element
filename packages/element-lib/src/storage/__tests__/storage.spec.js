const element = require('../../../index');

const testObj = {
  hello: 'world',
};

describe('storage', () => {
  beforeAll(() => {
    process.env.ELEMENT_IPFS_MULTIADDR = '/ip4/127.0.0.1/tcp/5001';
  });

  describe('write', () => {
    it('should write and return content id', async () => {
      const cid = await element.storage.write(testObj);
      expect(cid).toBe('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
    });
  });

  describe('read', () => {
    it('should write and return content id', async () => {
      const obj = await element.storage.read('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
      expect(obj).toEqual(testObj);
    });
  });
});
