const faker = require('faker');
const element = require('../../../index');

const { getLastOperation } = require('../test-utils');

const actors = {};
const getActorByIndex = index => actors[Object.keys(actors)[index]];

const generateActors = async (count) => {
  for (let i = 0; i < count; i++) {
    const mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic());
    const primaryKey = mks.getKeyForPurpose('primary', 0);
    const recoveryKey = mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = element.op.getDidDocumentModel(
      primaryKey.publicKey, recoveryKey.publicKey,
    );
    // eslint-disable-next-line no-await-in-loop
    const createPayload = await element.op.getCreatePayload(didDocumentModel, primaryKey);
    const didUniqueSuffix = element.func.getDidUniqueSuffix(createPayload);
    const actor = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: faker.name.findName(),
      email: faker.internet.email(),
      jobTitle: faker.name.jobTitle(),
      sameAs: [
        `https://www.facebook.com/${i}`,
        `https://www.linkedin.com/${i}`,
        `https://did.example.com/did:elem:${didUniqueSuffix}`,
      ],
    };
    actors[didUniqueSuffix] = {
      actor,
      createPayload,
      mks,
      didUniqueSuffix,
      primaryKey,
      recoveryKey,
    };
  }
  return actors;
};

const createByActorIndex = async (actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const primaryKey = actor.mks.getKeyForPurpose('primary', 0);
  const recoveryKey = actor.mks.getKeyForPurpose('recovery', 0);
  const didDocumentModel = element.op.getDidDocumentModel(
    primaryKey.publicKey, recoveryKey.publicKey,
  );
  return element.op.getCreatePayload(didDocumentModel, primaryKey);
};

const assertCreateSucceeded = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const did = `did:elem:${actor.didUniqueSuffix}`;
  const didDoc = await sidetree.resolve(did, true);
  expect(didDoc.id).toBe(did);
  expect(didDoc.publicKey[0].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('primary', 0).publicKey,
  );
  expect(didDoc.publicKey[1].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('recovery', 0).publicKey,
  );
};

const updateByActorIndex = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  // FIXME
  // make sure getPreviousOperationHash will hit cache.
  const { didUniqueSuffix } = getActorByIndex(actorIndex);
  await sidetree.resolve(didUniqueSuffix, true);
  const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
  const newKey = actor.mks.getKeyForPurpose('primary', 10);
  return element.op.getUpdatePayloadForAddingAKey(
    lastOperation, '#newKey', 'signing', newKey.publicKey, actor.primaryKey.privateKey,
  );
};

const recoverByActorIndex = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const { didUniqueSuffix } = getActorByIndex(actorIndex);
  const newPrimaryPublicKey = actor.mks.getKeyForPurpose('primary', 20).publicKey;
  const newRecoveryPublicKey = actor.mks.getKeyForPurpose('recovery', 20).publicKey;
  const didDocumentModel = sidetree.op.getDidDocumentModel(
    newPrimaryPublicKey, newRecoveryPublicKey,
  );
  return sidetree.op.getRecoverPayload(
    didUniqueSuffix, didDocumentModel, actor.recoveryKey.privateKey,
  );
};

const assertUpdateSucceeded = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const newKey = actor.mks.getKeyForPurpose('primary', 10);
  const didDoc = await sidetree.resolve(`did:elem:${actor.didUniqueSuffix}`, true);
  expect(didDoc.id).toBe(`did:elem:${actor.didUniqueSuffix}`);
  expect(didDoc.publicKey[2].id).toBe('#newKey');
  expect(didDoc.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
};

const assertRecoverSucceeded = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const didDoc = await sidetree.resolve(`did:elem:${actor.didUniqueSuffix}`, true);
  expect(didDoc.id).toBe(`did:elem:${actor.didUniqueSuffix}`);
  expect(didDoc.publicKey[0].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('primary', 20).publicKey,
  );
  expect(didDoc.publicKey[1].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('recovery', 20).publicKey,
  );
};

const deactivateByActorIndex = async (actorIndex, version) => element.op.deactivate({
  didUniqueSuffix: getActorByIndex(actorIndex).didUniqueSuffix,
  recoveryPrivateKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', version)
    .privateKey,
});

const assertDeactivateSucceeded = async (sidetree, actorIndex) => {
  const didDoc = await sidetree.resolve(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
  expect(didDoc.publicKey.length).toBe(0);
};

module.exports = {
  generateActors,
  getActorByIndex,
  assertCreateSucceeded,
  assertRecoverSucceeded,
  assertUpdateSucceeded,
  deactivateByActorIndex,
  createByActorIndex,
  updateByActorIndex,
  assertDeactivateSucceeded,
  recoverByActorIndex,
};
