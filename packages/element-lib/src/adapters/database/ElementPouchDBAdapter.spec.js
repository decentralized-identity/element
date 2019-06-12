const ElementPouchDBAdapter = require('./ElementPouchDBAdapter');

let db;
const dbName = 'element-pouchdb.ElementPouchDBAdapter';

beforeAll(async () => {
  db = new ElementPouchDBAdapter({
    name: dbName,
  });
  await db.deleteDB();
});

afterAll(async () => {
  await db.close();
});

describe('ElementPouchDBAdapter', () => {
  const id = 'test:example:123';

  it('constructor takes a db name', () => {
    expect(db.dbName).toBe(dbName);
  });

  describe('write', () => {
    it('write succeeds first time', async () => {
      const record = await db.write(id, {
        data: 123,
      });
      expect(record.id).toBe(id);
    });

    // avoid document update conflict.
    it('write succeeds second time', async () => {
      const record = await db.write(id, {
        data: 456,
        type: 'test:example',
      });
      expect(record.id).toBe(id);
    });
  });

  describe('read', () => {
    it('can read by id', async () => {
      const record = await db.read(id);
      expect(record.data).toBe(456);
    });
  });

  describe('readCollection', () => {
    it('can read by type', async () => {
      const record = await db.readCollection('test:example');
      expect(record.length).toBe(1);
      expect(record[0].data).toBe(456);
    });
  });
});
