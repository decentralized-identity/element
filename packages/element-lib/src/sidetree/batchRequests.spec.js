const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const {
  generateActors,
  createByActorIndex,
  recoverByActorIndex,
} = require('../__tests__/__fixtures__//sidetreeTestUtils');

jest.setTimeout(30 * 1000);

let sidetree;

beforeEach(async () => {
  sidetree = await getLocalSidetree('batchRequests');
  generateActors(3);
});

afterEach(async () => {
  await sidetree.close();
});

describe('batchRequests', () => {
  it('can batch once..', async (done) => {
    expect.assertions(6);
    let currentBatch = await sidetree.db.read('element:sidetree:currentBatch');
    expect(currentBatch.operations).toBeUndefined();
    const reqs = [createByActorIndex(0), createByActorIndex(1), createByActorIndex(2)];
    await sidetree.batchRequests(reqs);
    currentBatch = await sidetree.db.read('element:sidetree:currentBatch');
    expect(currentBatch.operations).toBeDefined();
    let txns = await sidetree.getTransactions();
    expect(txns.length).toBe(0);

    txns = await sidetree.getTransactions();
    expect(txns.length).toBe(0);
    sidetree.serviceBus.on('element:sidetree:batchSubmitted', async () => {
      currentBatch = await sidetree.db.read('element:sidetree:currentBatch');
      expect(currentBatch.operations.length).toBe(0);
      txns = await sidetree.getTransactions();
      expect(txns.length).toBe(1);
      done();
    });
    await sidetree.startBatching();
    await sidetree.sleep(4);
    await sidetree.stopBatching();
  });

  it('can batch many times..', async (done) => {
    expect.assertions(8);
    let batchCount = 0;
    let txns = await sidetree.getTransactions();
    expect(txns.length).toBe(batchCount);
    sidetree.serviceBus.on('element:sidetree:batchSubmitted', async () => {
      batchCount++;
      txns = await sidetree.getTransactions();
      expect(txns.length).toBe(batchCount);
      if (batchCount === 6) {
        await sidetree.stopBatching();
        await sidetree.sleep(4);
        txns = await sidetree.getTransactions();
        expect(txns.length).toBe(batchCount);
        done();
      } else {
        const reqs = [
          await recoverByActorIndex(sidetree, 0, batchCount - 1),
          await recoverByActorIndex(sidetree, 1, batchCount - 1),
          await recoverByActorIndex(sidetree, 2, batchCount - 1),
        ];
        await sidetree.batchRequests(reqs);
      }
    });
    const reqs = [createByActorIndex(0), createByActorIndex(1), createByActorIndex(2)];
    await sidetree.batchRequests(reqs);
    await sidetree.startBatching();
  });
});
