const NodeCouchDb = require('node-couchdb');

class ElementCouchDBAdapter {
  constructor({ name, remote }) {
    const urlRegex = /https:\/\/(.*):(.*)@(.*)\/(.*)/;
    const parts = urlRegex.exec(remote);
    this.name = name;
    this.couch = new NodeCouchDb({
      host: parts[3],
      protocol: 'https',
      port: 443,
      auth: {
        user: parts[1],
        pass: parts[2],
      },
    });
  }

  async init() {
    if (!this.created) {
      await this.couch
        .createDatabase(this.name)
        .catch((err) => {
          // Sometimes the db already exists
          if (err.body.error !== 'file_exists') {
            throw err;
          }
        });
      this.created = true;
    }
  }

  async write(id, data) {
    console.log(id, data, this.created);
    await this.init();
    const res = await this.couch.insert(this.name, { _id: id, id, ...data });
    console.log(res);
    return res;
  }

  async read(id) {
    await this.init();
    const { data } = await this.couch.get(this.name, id);
    console.log(data);
    return data;
  }

  async readCollection(type) {
    await this.init();
    console.log('TODO', type);
  }

  async reset() {
    await this.init();
    await this.couch.dropDatabase(this.name);
    this.created = false;
    await this.init();
  }

  async close() {
    return this;
  }
}

module.exports = ElementCouchDBAdapter;
