const element = require('../../../index');

const testObj = {
  hello: 'world',
};

const config = require('../../../../json/config.local.json');

describe('storage.ipfs', () => {
  let storage;
  beforeAll(() => {
    storage = element.storage.ipfs.configure({
      multiaddr: config.ipfsApiMultiAddr,
    });
  });

  describe('configure', () => {
    it('should configure and return a storage interface', async () => {
      expect(storage.ipfs).toBeDefined();
    });
  });

  describe('write', () => {
    it('should write and return content id', async () => {
      const cid = await storage.write(testObj);
      expect(cid).toBe('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
    });
  });

  describe('read', () => {
    it('should write and return content id', async () => {
      const obj = await storage.read('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
      expect(obj).toEqual(testObj);
    });
  });
});
