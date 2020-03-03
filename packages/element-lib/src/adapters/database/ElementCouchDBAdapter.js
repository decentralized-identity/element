const NodeCouchDb = require('node-couchdb');

class ElementCouchDBAdapter {
  constructor({ name, remote, host }) {
    if (remote) {
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
    } else {
      this.name = name;
      this.couch = new NodeCouchDb({
        host,
        protocol: 'http',
        port: 5984,
        auth: {
          user: 'admin',
          pass: 'password',
        },
      });
    }
  }

  async init() {
    if (!this.created) {
      await this.couch.createDatabase(this.name).catch(err => {
        // Sometimes the db already exists
        if (err.body.error !== 'file_exists') {
          throw err;
        }
      });
      this.created = true;
    }
  }

  async write(id, data) {
    await this.init();
    const payload = {
      _id: id,
      id,
      ...data,
    };
    try {
      await this.couch.insert(this.name, payload);
    } catch (e) {
      const {
        data: { _rev },
      } = await this.couch.get(this.name, id);
      await this.couch.update(this.name, { _rev, ...payload });
    }
    return true;
  }

  async read(id) {
    await this.init();
    try {
      const { data } = await this.couch.get(this.name, id);
      return data;
    } catch (e) {
      return null;
    }
  }

  async readCollection(type) {
    await this.init();
    const mangoQuery = { selector: { type: { $eq: type } } };
    const parameters = {};
    const response = await this.couch.mango(this.name, mangoQuery, parameters);
    return response.data.docs;
  }

  async reset() {
    await this.init();
    await this.couch.dropDatabase(this.name);
    this.created = false;
    await this.init();
  }

  async deleteDB() {
    await this.init();
    await this.couch.dropDatabase(this.name);
    this.created = false;
  }

  async close() {
    return this;
  }
}

module.exports = ElementCouchDBAdapter;
