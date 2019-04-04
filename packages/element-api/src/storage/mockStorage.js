/* eslint-disable security/detect-object-injection */
let db = {};

const create = async ({ collection, key, value }) => {
  db[collection] = db[collection] || {};
  db = {
    ...db,
    [collection]: {
      ...db[collection],
      [key]: value,
    },
  };
  return db[collection][key];
};

const read = async ({ collection, key }) => {
  db[collection] = db[collection] || {};
  if (key) {
    return db[collection][key] ? db[collection][key] : {};
  }
  return Object.values(db[collection] || {});
};

const update = async ({ collection, key, value }) => {
  db[collection] = db[collection] || {};
  db = {
    ...db,
    [collection]: {
      ...db[collection],
      [key]: {
        ...db[collection][key],
        ...value,
      },
    },
  };
  return db[collection][key];
};

const remove = async ({ collection, key }) => {
  if (key) {
    if (db[collection]) {
      delete db[collection][key];
    }
  } else {
    delete db[collection];
  }
};

module.exports = {
  db,
  teardown: () => {},
  create,
  read,
  update,
  remove,
};
