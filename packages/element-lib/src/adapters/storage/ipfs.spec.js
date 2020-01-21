const element = require('../../../index');
const config = require('../json/config.local.json');

const testObj = {
  hello: 'world',
};

const testString = 'string';

const testInteger = 1;

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
    it('should write a JSON and return content id', async () => {
      const cid = await storage.write(testObj);
      expect(cid).toBe('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
    });

    it('should write a string and return content id', async () => {
      const cid = await storage.write(testString);
      expect(cid).toBe('QmT2PFvRp4VXeBtFRWJUfJpssK6UqTZ5eHpaYQNcEXfNn8');
    });

    it('should write an integer and return content id', async () => {
      const cid = await storage.write(testInteger);
      expect(cid).toBe('QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc');
    });
  });

  describe('read', () => {
    it('should read a JSON', async () => {
      const obj = await storage.read(
        'QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen'
      );
      expect(obj).toEqual(testObj);
    });

    it('should read a string', async () => {
      const obj = await storage.read(
        'QmT2PFvRp4VXeBtFRWJUfJpssK6UqTZ5eHpaYQNcEXfNn8'
      );
      expect(obj).toEqual(testString);
    });

    it('should read an integer', async () => {
      const obj = await storage.read(
        'QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc'
      );
      expect(obj).toEqual(testInteger);
    });
  });
});
