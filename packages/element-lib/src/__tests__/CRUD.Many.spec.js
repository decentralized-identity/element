jest.setTimeout(10 * 1000);

const {
  getActorByIndex,
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

const { getTestSideTree } = require('./test-utils');

const sidetree = getTestSideTree();

afterAll(async () => {
  await sidetree.close();
});

const count = 3;
let actors = {};

describe('CRUD.Many', () => {
  it('can use fixtures to generate actors', async () => {
    actors = await generateActors(count);
    expect(Object.keys(actors).length).toBe(count);
  });

  it('transaction 0 & 1 create', async () => {
    const actor1 = getActorByIndex(0);
    const actor2 = getActorByIndex(1);
    await sidetree.operationQueue.enqueue(actor1.didUniqueSuffix, actor1.createPayload);
    await sidetree.operationQueue.enqueue(actor2.didUniqueSuffix, actor2.createPayload);
    await sidetree.batchWrite();
    await assertCreateSucceeded(sidetree, 0);
    await assertCreateSucceeded(sidetree, 1);

    const actor3 = getActorByIndex(2);
    await sidetree.operationQueue.enqueue(actor3.didUniqueSuffix, actor3.createPayload);
    await sidetree.batchWrite();
    await assertCreateSucceeded(sidetree, 2);
  });

  // it('transaction 2 & 3 update, recover', async () => {
  //   await updateByActorIndex(sidetree, 0, 0),
  //   await sidetree.createTransactionFromRequests([
  //     await recoverByActorIndex(sidetree, 1, 0),
  //   ]);
  //   await assertUpdateSucceeded(sidetree, 0);
  //   await assertRecoverSucceeded(sidetree, 1);
  //   await sidetree.createTransactionFromRequests([
  //     await updateByActorIndex(sidetree, 1, 1),
  //     await recoverByActorIndex(sidetree, 0, 0),
  //   ]);
  //   await assertUpdateSucceeded(sidetree, 1);
  //   await assertRecoverSucceeded(sidetree, 0);
  // });

  // it('transaction 4 & 5 deactivate', async () => {
  //   await sidetree.createTransactionFromRequests([
  //     await deactivateByActorIndex(0, 1),
  //     await deactivateByActorIndex(2, 0),
  //   ]);
  //   await assertDeactivateSucceeded(sidetree, 0);
  //   await assertDeactivateSucceeded(sidetree, 2);
  //   await sidetree.createTransactionFromRequests([await deactivateByActorIndex(1, 1)]);
  //   await assertDeactivateSucceeded(sidetree, 1);
  // });
});
