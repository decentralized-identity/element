// eslint-disable-next-line
if (typeof localStorage === 'undefined' || localStorage === null) {
  const { LocalStorage } = require('node-localstorage');
  // eslint-disable-next-line
  localStorage = new LocalStorage('./elem-cache');
}

// eslint-disable-next-line
const getItem = id => JSON.parse(localStorage.getItem(id));

const setItem = (id, value) => {
  // eslint-disable-next-line
  localStorage.setItem(id, JSON.stringify(value));
  return value;
};

module.exports = {
  getItem,
  setItem,
};
