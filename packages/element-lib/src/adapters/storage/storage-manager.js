const objectToMultihash = require('../../func/objectToMultihash');

class StorageManager {
  constructor(db, storage, options) {
    this.db = db;
    this.storage = storage;
    this.options = options || { autoPersist: false, retryIntervalSeconds: 5 };
  }

  retryUntilDone() {
    this.interval = setInterval(async () => {
      const pendingCount = await this.getNotPersistedLength();
      if (pendingCount === 0) {
        clearInterval(this.interval);
        return false;
      }
      await this.retryAllNotPersisted();
      return true;
    }, 1 * this.options.retryIntervalSeconds * 1000); // every 5 seconds
  }

  async getNotPersistedLength() {
    return this.db.collection
      .find({ type: { $eq: 'ipfs:data' }, persisted: { $eq: false } })
      .exec()
      .then(arrayOfDocs => arrayOfDocs.map(doc => doc.toJSON())).length;
  }

  async retryAllNotPersisted() {
    const allUnPersisted = await this.db.collection
      .find({ type: { $eq: 'ipfs:data' }, persisted: { $eq: false } })
      .exec()
      .then(arrayOfDocs => arrayOfDocs.map(doc => doc.toJSON()));
    await Promise.all(
      allUnPersisted.map(async (item) => {
        try {
          const cid = await this.storage.write(item.ipfsData);
          if (cid !== item.ipfsHash) {
            throw new Error('CID is not valid.');
          }
          await this.db.write(item.id, {
            type: 'ipfs:data',
            ipfsHash: item.ipfsHash,
            ipfsData: item.ipfsData,
            persisted: true,
          });
        } catch (e) {
          // console.log('still failing');
        }
      }),
    );
  }

  async write(object) {
    const key = await objectToMultihash(object);
    await this.db.write(`ipfs:${key}`, {
      type: 'ipfs:data',
      ipfsHash: key,
      ipfsData: object,
      persisted: false,
    });

    try {
      const cid = await this.storage.write(object);

      if (cid !== key) {
        throw new Error('CID is not valid.');
      }

      await this.db.write(`ipfs:${key}`, {
        type: 'ipfs:data',
        ipfsHash: key,
        ipfsData: object,
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
      const data = await this.db.read(`ipfs:${cid}`);
      if (data.persisted) {
        return data.ipfsData;
      }
      console.warn('Data returned from manager, but not persisted...', data);
      return data.ipfsData;
    } catch (e) {
      throw new Error(`Invalid JSON: https://ipfs.io/ipfs/${cid}`);
    }
  }

  close() {
    this.storage.close();
    this.db.close();
  }
}

module.exports = StorageManager;
