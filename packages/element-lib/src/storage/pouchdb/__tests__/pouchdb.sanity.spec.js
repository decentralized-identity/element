const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

describe('pouchdb.sanity', () => {
  let db;

  beforeAll(async () => {
    db = new PouchDB('element-pouchdb');
  });

  it('put', async () => {
    const todo = {
      _id: new Date().toISOString(),
      title: 'test',
      completed: false,
    };
    const resp = await db.put(todo);

    expect(resp.ok).toBe(true);
  });
  afterAll(async () => {
    await db.close();
  });
});
