const firebaseStorage = require('../storage/firebaseStorage');
const mockStorage = require('../storage/mockStorage');

let storage = firebaseStorage;
if (process.env.NODE_ENV === 'testing') {
  storage = mockStorage;
}

const getBatchFile = async () => {
  const operations = await storage.read({
    collection: 'batch-operations',
  });

  return {
    operations,
  };
};

const addOp = async (op) => {
  const batchFile = await getBatchFile();

  if (batchFile && batchFile.operations) {
    if (batchFile.operations.includes(op)) {
      throw new Error('403 Operation exists.');
    }
  }
  const index = batchFile.operations ? batchFile.operations.length : 0;
  return storage.create({ collection: 'batch-operations', key: index.toString(), value: op });
};

const deleteBatchFile = async () => storage.remove({
  collection: 'batch-operations',
});

module.exports = {
  getBatchFile,
  addOp,
  deleteBatchFile,
  teardown: storage.teardown,
};
