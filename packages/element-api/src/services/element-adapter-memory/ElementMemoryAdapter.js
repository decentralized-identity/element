class ElementMemoryAdapter {
  constructor() {
    this.db = {};
  }

  async write(id, data) {
    // eslint-disable-next-line
    this.db[id] = data;
    return {
      id,
    };
  }

  async read(id) {
    // eslint-disable-next-line
    return this.db[id];
  }

  async readCollection(type) {
    return Object.values(this.db).filter(i => i.type === type);
  }

  async deleteDB() {
    this.db = {};
  }

  async close() {
    this.deleteDB();
  }
}

module.exports = ElementMemoryAdapter;
