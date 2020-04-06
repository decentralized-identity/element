jest.setTimeout(10 * 1000);

const {
  getTestSideTree,
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
let actors;
let alice;

beforeAll(async () => {
  actors = await generateActors(sidetree, 1);
  [alice] = Object.values(actors);
});

describe('CRUD.One', () => {
  it('create', async () => {
    const txn = await sidetree.batchScheduler.writeNow(alice.createPayload);
    expect(txn).toBeDefined();
    await assertCreateSucceeded(sidetree, 0);
  });

  it('recover', async () => {
    const recoverPayload = await recoverByActorIndex(sidetree, 0);
    const txn = await sidetree.batchScheduler.writeNow(recoverPayload);
    expect(txn).toBeDefined();
    await assertRecoverSucceeded(sidetree, 0);
    actors[alice.didUniqueSuffix].primaryKey = alice.mks.getKeyForPurpose(
      'primary',
      20
    );
    actors[alice.didUniqueSuffix].recoveryKey = alice.mks.getKeyForPurpose(
      'recovery',
      20
    );
  });

  it('update', async () => {
    const updatePayload = await updateByActorIndex(sidetree, 0);
    const txn = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(txn).toBeDefined();
    await assertUpdateSucceeded(sidetree, 0);
  });

  it('deactivate', async () => {
    const deletePayload = await deactivateByActorIndex(sidetree, 0);
    const txn = await sidetree.batchScheduler.writeNow(deletePayload);
    expect(txn).toBeDefined();
    await assertDeactivateSucceeded(sidetree, 0);
  });
});
