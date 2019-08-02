const ElementRXDBAdapter = require('./ElementRXDBAdapter');

let db;
const dbName = 'elementrxdb';

beforeAll(async () => {
  db = new ElementRXDBAdapter({
    name: dbName,
  });
  await db.init();
});

afterAll(async () => {
  await db.close();
});

describe('ElementPouchDBAdapter', () => {
  const id = 'test:example:123';

  it('constructor takes a db name', () => {
    expect(db.name).toBe(dbName);
  });

  describe('write', () => {
    it('should create a record', async () => {
      const record = await db.write(id, {
        anchorFileHash: 123,
      });
      expect(record.id).toBe(id);
      expect(record.anchorFileHash).toBe(123);
    });

    it('overwrite the record', async () => {
      const record = await db.write(id, {
        anchorFileHash: 456,
        type: 'test:example',
      });
      expect(record.id).toBe(id);
      expect(record.anchorFileHash).toBe(456);
      expect(record.type).toBe('test:example');
    });
  });

  describe('read', () => {
    it('can read by id', async () => {
      const record = await db.read(id);
      expect(record.id).toBe(id);
      expect(record.anchorFileHash).toBe(456);
      expect(record.type).toBe('test:example');
    });
  });

  describe('readCollection', () => {
    it('can read by type', async () => {
      const record = await db.readCollection('test:example');
      expect(record.length).toBe(1);
      expect(record[0].anchorFileHash).toBe(456);
    });
  });
});
