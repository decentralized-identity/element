const element = require('../../../index');
const config = require('../json/config.local.json');

const StorageManager = require('./storage-manager');

const anchorFile = {
  merkleRoot:
    '2fd0f5e87f72d787235ee6c1673500c9929a2559edfcdf3637ba9ab05a827a16',
  batchFileHash: 'QmTT6BwuEeDgNs3ixQ2G29izoPawSjAh8wT97uZek5BQVG',
  didUniqueSuffixes: ['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'],
};

const anchorFile2 = {
  merkleRoot:
    '2fd0f5e87f72d787235ee6c1673500c9929a2559edfcdf3637ba9ab05a827a16',
  batchFileHash: 'QmTT6BwuEeDgNs3ixQ2G29izoPawSjAh8wT97uZek5BQVG',
  didUniqueSuffixes: ['XRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'],
};

jest.setTimeout(20 * 1000);

describe('StorageManager', () => {
  let storage;
  let db;

  beforeAll(() => {
    storage = element.storage.ipfs.configure({
      multiaddr: config.ipfsApiMultiAddr,
    });
    db = new element.adapters.database.ElementRXDBAdapter({
      name: 'storage-manager',
      adapter: 'memory',
    });
  });

  describe('constructor', () => {
    it('should create a manager instance', async () => {
      const manager = new StorageManager(db, storage, {
        autoPersist: false,
        retryIntervalSeconds: 4,
      });
      expect(manager.storage.ipfs).toBeDefined();
      expect(manager.db).toBeDefined();
    });
  });

  describe('smart write', () => {
    it('should should use db and storage', async () => {
      const manager = new StorageManager(db, storage, {
        autoPersist: false,
        retryIntervalSeconds: 4,
      });
      const cid = await manager.write(anchorFile);
      expect(cid).toBe('QmXRoAeyBTKA3N8D4NLR6wtEes4iwzeMien78cZy2YP3ba');
      const record = await manager.db.read(
        `element:sidetree:cas-cachable:${cid}`
      );
      expect(record.id).toBe(`element:sidetree:cas-cachable:${cid}`);
      const data = await manager.storage.read(cid);
      expect(data).toEqual(anchorFile);
      expect(record.persisted).toBe(true);
    });

    it('can persist from db manually', async () => {
      const manager = new StorageManager(db, storage, {
        autoPersist: false,
        retryIntervalSeconds: 4,
      });
      let count = 0;
      const fakeStorage = {
        write: async data => {
          if (count === 2) {
            return storage.write(data);
          }
          count += 1;
          throw new Error('Fake IPFS is down error');
        },
      };
      const mockedManager = new StorageManager(db, fakeStorage);

      const cid = await mockedManager.write(anchorFile2);
      expect(cid).toBe('Qma4AeAHhwkFJNHGZ59KpShSmCbnT2JUSCNjffk3h5dm3f');

      await mockedManager.retryAllNotPersisted();

      const allUnPersisted2 = await mockedManager.db.collection
        .find({
          type: { $eq: 'element:sidetree:cas-cachable' },
          persisted: { $eq: false },
        })
        .exec()
        .then(arrayOfDocs => arrayOfDocs.map(doc => doc.toJSON()));

      expect(allUnPersisted2.length).toBe(1);

      // can read without persistence
      const obj = await manager.read(
        'Qma4AeAHhwkFJNHGZ59KpShSmCbnT2JUSCNjffk3h5dm3f'
      );
      expect(obj).toEqual(anchorFile2);

      await mockedManager.retryAllNotPersisted();

      const allUnPersisted3 = await mockedManager.db.collection
        .find({
          type: { $eq: 'element:sidetree:cas-cachable' },
          persisted: { $eq: false },
        })
        .exec()
        .then(arrayOfDocs => arrayOfDocs.map(doc => doc.toJSON()));

      expect(allUnPersisted3.length).toBe(0);

      const record = await manager.db.read(
        `element:sidetree:cas-cachable:${cid}`
      );
      expect(record.id).toBe(`element:sidetree:cas-cachable:${cid}`);
      const data = await manager.storage.read(cid);
      expect(data).toEqual(anchorFile2);
      expect(record.persisted).toBe(true);
    });

    // need to fix this when we add proper support for remote couchdb
    // this hack was added to fix failing IPFS issues
    // eslint-disable-next-line
    it.skip('can persist from db autmatically', done => {
      let count = 0;
      const fakeStorage = {
        write: async data => {
          if (count === 2) {
            const res = await storage.write(data);
            done();
            return res;
          }
          count += 1;
          throw new Error('Fake IPFS is down error');
        },
      };
      const mockedManager = new StorageManager(db, fakeStorage, {
        autoPersist: true,
        retryIntervalSeconds: 1,
      });
      mockedManager.write(anchorFile2);
    });

    it('can read after persisted', async () => {
      const obj = await storage.read(
        'Qma4AeAHhwkFJNHGZ59KpShSmCbnT2JUSCNjffk3h5dm3f'
      );
      expect(obj).toEqual(anchorFile2);
    });
  });
});
