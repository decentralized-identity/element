const faker = require('faker');
const element = require('../../../index');

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

const assertRecoverSucceeded = async (sidetree, actorIndex) => {
  const didDoc = await sidetree.resolve(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
  expect(didDoc.id).toBe(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
  expect(didDoc.publicKey[0].publicKeyHex).toBe(
    getActorByIndex(actorIndex).mks.getKeyForPurpose('primary', 1).publicKey,
  );
  expect(didDoc.publicKey[1].publicKeyHex).toBe(
    getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', 1).publicKey,
  );
};

const assertUpdateSucceeded = async (sidetree, actorIndex) => {
  const didDoc = await sidetree.resolve(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
  expect(didDoc.service[0].id).toBe('#element.orbitdb');
};

const updateByActorIndex = async (sidetree, actorIndex, version) => {
  // make sure getPreviousOperationHash will hit cache.
  await sidetree.resolve(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
  return element.op.update({
    didUniqueSuffix: getActorByIndex(actorIndex).didUniqueSuffix,
    previousOperationHash: await sidetree.getPreviousOperationHash(
      getActorByIndex(actorIndex).didUniqueSuffix,
    ),
    patch: [
      {
        op: 'replace',
        path: '/service',
        value: [
          {
            id: '#element.orbitdb',
            type: 'OrbitDB.PublicAttestationStore',
            serviceEndpoint:
              'https://api.example.com/orbitdb/QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43',
          },
        ],
      },
    ],
    primaryPrivateKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('primary', version)
      .privateKey,
  });
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

const recoverByActorIndex = async (sidetree, actorIndex, version) => {
  // make sure getPreviousOperationHash will hit cache.
  await sidetree.resolve(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
  return element.op.recover({
    didUniqueSuffix: getActorByIndex(actorIndex).didUniqueSuffix,
    previousOperationHash: await sidetree.getPreviousOperationHash(
      getActorByIndex(actorIndex).didUniqueSuffix,
    ),
    newPrimaryPublicKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('primary', version + 1).publicKey,
    newRecoveryPublicKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', version + 1).publicKey,
    recoveryPrivateKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', version)
      .privateKey,
  });
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
