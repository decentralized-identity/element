/* eslint-disable jest/expect-expect */
jest.setTimeout(20 * 1000);

const {
  getTestSideTree,
  getActorByIndex,
  generateActors,
  updateByActorIndex,
  recoverByActorIndex,
  deactivateByActorIndex,
  assertCreateSucceeded,
  assertUpdateSucceeded,
  assertRecoverSucceeded,
  assertDeactivateSucceeded,
} = require('./test-utils');

const sidetree = getTestSideTree();

afterAll(async () => {
  await sidetree.close();
});

const count = 3;
let actors = {};

describe('CRUD.Many', () => {
  it('can use fixtures to generate actors', async () => {
    actors = await generateActors(sidetree, count);
    expect(Object.keys(actors).length).toBe(count);
  });

  it('transaction 0 & 1 create', async () => {
    const actor1 = getActorByIndex(0);
    const actor2 = getActorByIndex(1);
    await sidetree.operationQueue.enqueue(
      actor1.didUniqueSuffix,
      actor1.createPayload
    );
    await sidetree.operationQueue.enqueue(
      actor2.didUniqueSuffix,
      actor2.createPayload
    );
    await sidetree.batchWrite();
    await assertCreateSucceeded(sidetree, 0);
    await assertCreateSucceeded(sidetree, 1);

    const actor3 = getActorByIndex(2);
    await sidetree.operationQueue.enqueue(
      actor3.didUniqueSuffix,
      actor3.createPayload
    );
    await sidetree.batchWrite();
    await assertCreateSucceeded(sidetree, 2);
  });

  it('transaction 2 & 3 update, recover', async () => {
    const actor1 = getActorByIndex(0);
    const actor2 = getActorByIndex(1);
    const updatePayload1 = await updateByActorIndex(sidetree, 0);
    const recoverPayload2 = await recoverByActorIndex(sidetree, 1);
    await sidetree.operationQueue.enqueue(
      actor1.didUniqueSuffix,
      updatePayload1
    );
    await sidetree.operationQueue.enqueue(
      actor2.didUniqueSuffix,
      recoverPayload2
    );
    await sidetree.batchWrite();
    await assertUpdateSucceeded(sidetree, 0);
    await assertRecoverSucceeded(sidetree, 1);
    actors[actor2.didUniqueSuffix].primaryKey = actor2.mks.getKeyForPurpose(
      'primary',
      20
    );
    actors[actor2.didUniqueSuffix].recoveryKey = actor2.mks.getKeyForPurpose(
      'recovery',
      20
    );

    const updatePayload2 = await updateByActorIndex(sidetree, 1);
    const recoverPayload1 = await recoverByActorIndex(sidetree, 0);
    await sidetree.operationQueue.enqueue(
      actor1.didUniqueSuffix,
      updatePayload2
    );
    await sidetree.operationQueue.enqueue(
      actor2.didUniqueSuffix,
      recoverPayload1
    );
    await sidetree.batchWrite();
    await assertUpdateSucceeded(sidetree, 1);
    await assertRecoverSucceeded(sidetree, 0);
    actors[actor1.didUniqueSuffix].primaryKey = actor1.mks.getKeyForPurpose(
      'primary',
      20
    );
    actors[actor1.didUniqueSuffix].recoveryKey = actor1.mks.getKeyForPurpose(
      'recovery',
      20
    );
  });

  it('transaction 4 & 5 deactivate', async () => {
    const actor1 = getActorByIndex(0);
    const actor3 = getActorByIndex(2);
    const deletePayload1 = await deactivateByActorIndex(sidetree, 0);
    const deletePayload3 = await deactivateByActorIndex(sidetree, 2);
    await sidetree.operationQueue.enqueue(
      actor1.didUniqueSuffix,
      deletePayload1
    );
    await sidetree.operationQueue.enqueue(
      actor3.didUniqueSuffix,
      deletePayload3
    );
    await sidetree.batchWrite();
    await assertDeactivateSucceeded(sidetree, 0);
    await assertDeactivateSucceeded(sidetree, 2);

    const actor2 = getActorByIndex(1);
    const deletePayload2 = await deactivateByActorIndex(sidetree, 1);
    await sidetree.operationQueue.enqueue(
      actor2.didUniqueSuffix,
      deletePayload2
    );
    await sidetree.batchWrite();
    await assertDeactivateSucceeded(sidetree, 1);
  });
});
