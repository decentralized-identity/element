const { objectToMultihash } = require('../../func');

class StorageManager {
  constructor(db, storage, options) {
    this.db = db;
    this.storage = storage;
    this.options = options || { autoPersist: false, retryIntervalSeconds: 5 };
    this.logger = console;
  }

  retryUntilDone() {
    this.interval = setInterval(async () => {
      const pendingCount = (await this.getNotPersisted()).length;
      if (pendingCount === 0) {
        clearInterval(this.interval);
        return false;
      }
      await this.retryAllNotPersisted();
      await this.db.awaitableSync();
      return true;
    }, 1 * this.options.retryIntervalSeconds * 1000); // every 5 seconds
  }

  async getNotPersisted() {
    return (await this.db.readCollection(
      'element:sidetree:cas-cachable'
    )).filter(doc => doc.persisted === false);
  }

  async retryAllNotPersisted() {
    const allUnPersisted = await this.getNotPersisted();
    await Promise.all(
      allUnPersisted.map(async item => {
        try {
          const cid = await this.storage.write(item.object);
          if (cid !== item.multihash) {
            throw new Error('CID is not valid.');
          }
          await this.db.write(item.id, {
            type: 'element:sidetree:cas-cachable',
            multihash: item.multihash,
            object: item.object,
            persisted: true,
          });
        } catch (e) {
          // console.log('still failing');
        }
      })
    );
  }

  async write(object) {
    const key = await objectToMultihash(object);
    const cacheWriteResult = await this.db.write(
      `element:sidetree:cas-cachable:${key}`,
      {
        type: 'element:sidetree:cas-cachable',
        multihash: key,
        object,
        persisted: false,
      }
    );

    // console.log('cacheWriteResult: ', cacheWriteResult);

    try {
      const cid = await this.storage.write(object);

      if (cid !== key || cid !== cacheWriteResult.multihash) {
        throw new Error('CID is not valid.');
      }

      await this.db.write(`element:sidetree:cas-cachable:${key}`, {
        type: 'element:sidetree:cas-cachable',
        multihash: key,
        object,
        persisted: true,
      });
    } catch (e) {
      // ipfs failed, check options and maybe retry forever...
      if (this.options.autoPersist) {
        this.retryUntilDone();
      }
    }

    return key;
  }

  async read(cid) {
    try {
      const data = await this.db.read(`element:sidetree:cas-cachable:${cid}`);
      // maybe data was created on another node, try to read ipfs.
      if (data === null || data === undefined) {
        const fromStorage = await this.storage.read(cid);
        if (fromStorage) {
          await this.db.write(`element:sidetree:cas-cachable:${cid}`, {
            type: 'element:sidetree:cas-cachable',
            multihash: cid,
            object: fromStorage,
            persisted: true,
          });
          return fromStorage;
        }
      }
      if (data.persisted) {
        return data.object;
      }
      this.logger.warn(
        `Data returned from manager, but not persisted... ${JSON.stringify(
          data
        )}`
      );
      return data.object;
    } catch (e) {
      throw new Error('Could not read element:sidetree:cas-cachable');
    }
  }

  close() {
    this.storage.close();
    this.db.close();
  }
}

module.exports = StorageManager;
