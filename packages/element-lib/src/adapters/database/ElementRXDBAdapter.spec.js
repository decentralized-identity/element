const ElementRXDBAdapter = require('./ElementRXDBAdapter');

let db;
const dbName = 'elementrxdb';

beforeAll(async () => {
  db = new ElementRXDBAdapter({
    name: dbName,
    adapter: 'memory',
  });
});

afterAll(async () => {
  await db.close();
});

describe('ElementRXDBAdapter', () => {
  const id1 = 'id1';
  const id2 = 'id2';
  const id3 = 'id3';
  const type1 = 'type1';
  const type2 = 'type2';
  const type3 = 'type3';
  const anchorFileHash1 = 'anchorFileHash1';
  const anchorFileHash2 = 'anchorFileHash2';

  describe('constructor', () => {
    it('should set dbName', () => {
      expect(db.name).toBe(dbName);
    });

    it('should set adapter', () => {
      expect(db.adapter).toBeDefined();
    });
  });

  describe('write', () => {
    it('should create a record', async () => {
      const record = await db.write(id1, {
        anchorFileHash: anchorFileHash1,
      });
      expect(record.id).toBe(id1);
      expect(record.anchorFileHash).toBe(anchorFileHash1);
    });

    it('overwrite the record if same id is specified', async () => {
      const record = await db.write(id1, {
        anchorFileHash: anchorFileHash2,
        type: type1,
      });
      expect(record.id).toBe(id1);
      expect(record.anchorFileHash).toBe(anchorFileHash2);
      expect(record.type).toBe(type1);
    });
  });

  describe('read', () => {
    it('should return the record if it exists', async () => {
      const record = await db.read(id1);
      expect(record.id).toBe(id1);
      expect(record.anchorFileHash).toBe(anchorFileHash2);
      expect(record.type).toBe(type1);
    });

    it('should return null if record does not exist', async () => {
      const record = await db.read(id2);
      expect(record).toBe(null);
    });
  });

  describe('readCollection', () => {
    beforeAll(async () => {
      // Create a new record with the same type
      await db.write(id2, {
        anchorFileHash: anchorFileHash1,
        type: type1,
      });
      // Create a new record with a different type
      await db.write(id3, {
        anchorFileHash: anchorFileHash1,
        type: type2,
      });
    });

    it('should return only records of the given type', async () => {
      const record = await db.readCollection(type1);
      expect(record.length).toBe(2);
      expect(record[0].id).toBe(id1);
      expect(record[1].id).toBe(id2);
    });

    it('should return an empty array if no record has the given type', async () => {
      const record = await db.readCollection(type3);
      expect(record).toEqual([]);
    });
  });

  describe('deleteDB', () => {
    it('should remove all records', async () => {
      expect(await db.read(id1)).toBeDefined();
      expect(await db.read(id2)).toBeDefined();
      expect(await db.read(id3)).toBeDefined();
      await db.deleteDB();
      expect(await db.read(id1)).toBe(null);
      expect(await db.read(id2)).toBe(null);
      expect(await db.read(id3)).toBe(null);
    });
  });
});
