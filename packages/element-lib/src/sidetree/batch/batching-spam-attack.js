/* eslint-disable no-console */
const { getCreatePayloadForKeyIndex } = require('../../__tests__/test-utils');
const { MnemonicKeySystem } = require('../../../index');
const element = require('../../../index');

class Attacker {
  constructor(sidetree, numberOfOperations) {
    this.mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    this.sidetree = sidetree;
    this.numberOfOperations = numberOfOperations;
  }

  async start() {
    const operationNumbers = [...Array(this.numberOfOperations).keys()];
    const promises = operationNumbers.map(async index => {
      const createPayload = await getCreatePayloadForKeyIndex(
        this.sidetree,
        this.mks,
        index
      );
      const didUniqueSuffix = this.sidetree.func.getDidUniqueSuffix(
        createPayload
      );
      return { didUniqueSuffix, operationBuffer: createPayload };
    });
    this.queue = await Promise.all(promises);
    await this.sidetree.db.write('operationQueue', { queue: this.queue });
  }
}

const db = new element.adapters.database.ElementRXDBAdapter({
  name: 'element-test',
  adapter: 'memory',
});

const storage = element.storage.ipfs.configure({
  multiaddr: '/ip4/127.0.0.1/tcp/5001',
});

const blockchain = element.blockchain.ethereum.configure({
  mnemonic:
    'hazard pride garment scout search divide solution argue wait avoid title cave',
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: 'http://localhost:8545',
});

const parameters = {
  maxOperationsPerBatch: 10000,
  batchingIntervalInSeconds: 10,
  didMethodName: 'did:elem:ropsten',
  logLevel: 'info',
};

const sidetree = new element.Sidetree({
  db,
  storage,
  blockchain,
  parameters,
});

// eslint-disable-next-line no-unused-vars
const attackFullSyncNode = async n => {
  // Attacker created transactions
  let start = Date.now();
  const attacker = new Attacker(sidetree, n);
  await attacker.start();
  let end = Date.now();
  console.log(`attacker created ${n} operations in ${(end - start) / 1000}s`);
  // Sidetree processed transactions in batch
  start = Date.now();
  await sidetree.batchWrite();
  end = Date.now();
  console.log(
    `sidetree wrote a batch of ${n} operations in ${(end - start) / 1000}s`
  );
  // Observer should sync
  start = Date.now();
  await sidetree.sync();
  end = Date.now();
  console.log(`observer synced ${n} operations in ${(end - start) / 1000}s`);
  // All transactions should be resolveable
  start = Date.now();
  const { didUniqueSuffix } = attacker.queue[0];
  await sidetree.resolve(didUniqueSuffix);
  end = Date.now();
  console.log(`user resolved a did in ${(end - start) / 1000}s`);
};

const attackJustInTimeSyncNode = async n => {
  // Attacker created transactions
  let start = Date.now();
  const attacker = new Attacker(sidetree, n);
  await attacker.start();
  let end = Date.now();
  console.log(`attacker created ${n} operations in ${(end - start) / 1000}s`);
  // Sidetree processed transactions in batch
  start = Date.now();
  await sidetree.batchWrite();
  end = Date.now();
  console.log(
    `sidetree wrote a batch of ${n} operations in ${(end - start) / 1000}s`
  );
  // Resolver should sync did
  start = Date.now();
  const { didUniqueSuffix } = attacker.queue[0];
  await sidetree.sync(didUniqueSuffix);
  end = Date.now();
  console.log(`observer synced ${n} operations in ${(end - start) / 1000}s`);
  // All transactions should be resolveable
  start = Date.now();
  await sidetree.resolve(didUniqueSuffix);
  end = Date.now();
  console.log(`user resolved a did in ${(end - start) / 1000}s`);
};

(async () => {
  //  await attackFullSyncNode(10);
  //  await attackFullSyncNode(100);
  //  await attackFullSyncNode(1000);
  //  await attackFullSyncNode(2000);
  //  await attackFullSyncNode(5000);
  //  await attackFullSyncNode(10000);
  //
  await attackJustInTimeSyncNode(10);
  await attackJustInTimeSyncNode(100);
  await attackJustInTimeSyncNode(1000);
  await attackJustInTimeSyncNode(2000);
  await attackJustInTimeSyncNode(5000);
  await attackJustInTimeSyncNode(10000);
  // eslint-disable-next-line no-process-exit
  process.exit(0);
})();
