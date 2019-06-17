jest.setTimeout(10 * 1000);

const {
  generateActors,
  createByActorIndex,
  updateByActorIndex,
  recoverByActorIndex,
  deactivateByActorIndex,
  assertCreateSucceeded,
  assertUpdateSucceeded,
  assertRecoverSucceeded,
  assertDeactivateSucceeded,
} = require('./__fixtures__/sidetreeTestUtils');
const getLocalSidetree = require('./__fixtures__/getLocalSidetree');

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('CRUD.Many');
});

afterAll(async () => {
  await sidetree.close();
});

const count = 3;
let actors = {};

describe('CRUD.Many', () => {
  it('can use fixtures to generate actors', async () => {
    actors = generateActors(count);
    expect(Object.keys(actors).length).toBe(count);
  });

  it('transaction 0 & 1 create', async () => {
    const txn0 = await sidetree.createTransactionFromRequests([
      createByActorIndex(0),
      createByActorIndex(1),
    ]);
    await sidetree.sync({
      fromTransactionTime: txn0.transactionTime,
      toTransactionTime: txn0.transactionTime,
    });
    await assertCreateSucceeded(sidetree, 0);
    await assertCreateSucceeded(sidetree, 1);

    const txn1 = await sidetree.createTransactionFromRequests([createByActorIndex(2)]);

    await sidetree.sync({
      fromTransactionTime: txn1.transactionTime,
      toTransactionTime: txn1.transactionTime,
    });
    await assertCreateSucceeded(sidetree, 2);
  });

  it('transaction 2 & 3 update, recover', async () => {
    await sidetree.createTransactionFromRequests([
      await updateByActorIndex(sidetree, 0, 0),
      await recoverByActorIndex(sidetree, 1, 0),
    ]);
    await assertUpdateSucceeded(sidetree, 0);
    await assertRecoverSucceeded(sidetree, 1);
    await sidetree.createTransactionFromRequests([
      await updateByActorIndex(sidetree, 1, 1),
      await recoverByActorIndex(sidetree, 0, 0),
    ]);
    await assertUpdateSucceeded(sidetree, 1);
    await assertRecoverSucceeded(sidetree, 0);
  });

  it('transaction 4 & 5 deactivate', async () => {
    await sidetree.createTransactionFromRequests([
      await deactivateByActorIndex(0, 1),
      await deactivateByActorIndex(2, 0),
    ]);
    await assertDeactivateSucceeded(sidetree, 0);
    await assertDeactivateSucceeded(sidetree, 2);
    await sidetree.createTransactionFromRequests([await deactivateByActorIndex(1, 1)]);
    await assertDeactivateSucceeded(sidetree, 1);
  });
});
