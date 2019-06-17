const { db, teardown } = require('../services/firebase');

const read = async ({ collection, key }) => {
  if (key) {
    return db
      .ref(`${collection}/${key}`)
      .once('value')
      .then(snap => snap.val() || {});
  }
  return db
    .ref(`${collection}`)
    .once('value')
    .then(snap => snap.val() || {})
    .then(obj => Object.values(obj));
};

const create = async ({ collection, key, value }) => {
  await db.ref(`${collection}/${key}`).set(value);
  return read({ collection, key });
};

const update = async ({ collection, key, value }) => {
  await db.ref(`${collection}/${key}`).update(value);
  return read({ collection, key });
};

const remove = async ({ collection, key }) => {
  const path = key ? `${collection}/${key}` : `${collection}`;
  return db.ref(path).set({});
};

module.exports = {
  teardown,
  create,
  read,
  update,
  remove,
};
