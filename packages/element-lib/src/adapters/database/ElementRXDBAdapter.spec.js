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
});
