jest.setTimeout(10 * 1000);
const element = require('../../index');
const config = require('../json/config.local.json');

let sidetree;

const ipfsStorage = element.storage.ipfs.configure({
  multiaddr: config.ipfsApiMultiAddr,
});

const db = new element.adapters.database.ElementRXDBAdapter({
  name: 'element-pouchdb.storage-manager-integration.spec',
});

const storage = new element.adapters.storage.StorageManager(db, ipfsStorage, {
  autoPersist: true,
});

const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

const blockchain = element.blockchain.ethereum.configure({
  hdPath: "m/44'/60'/0'/0/0",
  mnemonic: config.mnemonic,
  providerUrl: config.web3ProviderUrl,
  // when not defined, a new contract is created.
  // anchorContractAddress: config.anchorContractAddress,
});

beforeAll(async () => {
  await db.deleteDB();

  await blockchain.resolving;
  sidetree = new element.Sidetree({
    blockchain,
    storage,
    serviceBus,
    db,
  });
  return sidetree;
});

afterAll(async () => {
  await sidetree.close();
});

describe('Storage Manager Integration Test', () => {
  it('can create a transaction with the manager', async () => {
    const mnemonic = 'panda lion unfold live venue spice urban member march gift obvious gossip';
    const mks = new element.MnemonicKeySystem(mnemonic);
    const rootKey = mks.getKeyForPurpose('root', 0);
    const recoveryKey = mks.getKeyForPurpose('recovery', 0);

    const txn0 = await sidetree.createTransactionFromRequests([
      element.op.create({
        primaryKey: rootKey,
        recoveryPublicKey: recoveryKey.publicKey,
      }),
    ]);

    expect(txn0.transactionTime).toBeDefined();

    const anchorFile = await ipfsStorage.read(txn0.anchorFileHash);

    expect(anchorFile.batchFileHash).toBeDefined();
  });
});
