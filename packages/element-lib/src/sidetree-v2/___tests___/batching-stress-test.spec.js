const { getCreatePayloadForKeyIndex } = require('../test-utils');
const { MnemonicKeySystem } = require('../../../index');
const element = require('../../../index');

jest.setTimeout(200 * 1000);

class Attacker {
  constructor(sidetree, numberOfOperations) {
    this.mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    this.sidetree = sidetree;
    this.numberOfOperations = numberOfOperations;
  }

  async start() {
    const operationNumbers = [...Array(this.numberOfOperations).keys()];
    const promises = operationNumbers.map(async (index) => {
      const createPayload = await getCreatePayloadForKeyIndex(this.mks, index);
      const didUniqueSuffix = this.sidetree.func.getDidUniqueSuffix(createPayload);
      return { didUniqueSuffix, operationBuffer: createPayload };
    });
    this.queue = await Promise.all(promises);
    await this.sidetree.db.write('operationQueue', { queue: this.queue });
  }
}

describe('Batching stress test', () => {
  let sidetree;
  let attacker;

  beforeAll(async () => {
    const db = new element.adapters.database.ElementRXDBAdapter({
      name: 'element-test',
    });

    const storage = element.storage.ipfs.configure({
      multiaddr: '/ip4/127.0.0.1/tcp/5001',
    });

    const blockchain = element.blockchain.ethereum.configure({
      mnemonic: 'hazard pride garment scout search divide solution argue wait avoid title cave',
      hdPath: "m/44'/60'/0'/0/0",
      providerUrl: 'http://localhost:8545',
    });

    const parameters = {
      maxOperationsPerBatch: 10000,
      batchingIntervalInSeconds: 10,
    };

    sidetree = new element.SidetreeV2({
      db,
      storage,
      blockchain,
      parameters,
    });
  });

  const attack = async (n) => {
    // Attacker created transactions
    let start = Date.now();
    attacker = new Attacker(sidetree, n);
    await attacker.fastStart();
    let end = Date.now();
    console.log(`attacker created ${n} operations in ${(end - start) / 1000}s`);
    // Sidetree processed transactions in batch
    start = Date.now();
    await sidetree.batchWrite();
    end = Date.now();
    console.log(`sidetree wrote a batch of ${n} operations in ${(end - start) / 1000}s`);
    // Observer should sync
    start = Date.now();
    await sidetree.sync();
    end = Date.now();
    console.log(`observer synced ${n} operations in ${(end - start) / 1000}s`);
    // All transactions should be resolveable
    start = Date.now();
    const firstDid = attacker.queue[0].didUniqueSuffix;
    const firstDidDoc = await sidetree.resolve(firstDid);
    expect(firstDidDoc.id).toContain(firstDid);
    const lastDid = attacker.queue[attacker.queue.length - 1].didUniqueSuffix;
    const lastDidDoc = await sidetree.resolve(lastDid);
    expect(lastDidDoc.id).toContain(lastDid);
    end = Date.now();
    console.log(`user resolved a did in ${(end - start) / 1000}s`);
  };

  it('should handle 10 operations', async () => {
    await attack(10);
  });

  it('should handle 100 operations', async () => {
    await attack(100);
  });

  it('should handle 1000 operations', async () => {
    await attack(1000);
  });

  it('should handle 2000 operations', async () => {
    await attack(2000);
  });

  it('should handle 5000 operations', async () => {
    await attack(5000);
  });

  it('should handle 10000 operations', async () => {
    await attack(10000);
  });
});
