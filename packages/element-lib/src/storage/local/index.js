const objectToMultihash = require('../../func/objectToMultihash');

class LocalContentStorage {
  constructor(repo) {
    // eslint-disable-next-line
    if (typeof localStorage === 'undefined' || localStorage === null) {
      const { LocalStorage } = require('node-localstorage');
      // eslint-disable-next-line
      this.localStorage = new LocalStorage(repo || './elem-cache');
    } else {
      // eslint-disable-next-line
      this.localStorage = localStorage;
    }
  }

  async write(object) {
    const cid = await objectToMultihash(object);
    this.localStorage.setItem(cid, JSON.stringify(object));
    return cid;
  }

  async read(cid) {
    return JSON.parse(this.localStorage.getItem(cid));
  }
}

const configure = ({ multiaddr }) => new LocalContentStorage(multiaddr);

module.exports = {
  configure,
};
