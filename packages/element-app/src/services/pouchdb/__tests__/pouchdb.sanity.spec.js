const PouchDB = require('pouchdb');

const db = new PouchDB('element-pouchdb');

describe('pouchdb.sanity', () => {
  beforeAll(async () => {
    try {
      await db.put({
        _id: '_design/my_index',
        views: {
          by_name: {
            // eslint-disable-next-line
            map: function(doc) {
              // eslint-disable-next-line
              emit(doc.completed);
            }.toString(),
          },
        },
      });
    } catch (e) {
      // ignore
    }
  });
  it('put', async () => {
    const todo = {
      _id: new Date().toISOString(),
      title: 'hello',
      completed: false,
    };
    const record = await db.put(todo);

    console.log(record);
  });
  it('query', async () => {
    const record = await db.query('my_index/by_name');
    console.log(record);
  });
});
