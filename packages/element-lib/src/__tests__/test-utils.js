/* eslint-disable security/detect-object-injection */
// eslint-disable-next-line node/no-unpublished-require
const faker = require('faker');
const element = require('../../index');
const { encodeJson, decodeJson } = require('../func');

const didMethodName = 'did:elem:ropsten';

const didMethodNameWithoutNetworkIdentifier = 'did:elem';

const getTestSideTree = () => {
  const db = new element.adapters.database.ElementCouchDBAdapter({
    name: 'element-test',
    host: 'localhost',
  });

  const storage = element.storage.ipfs.configure({
    multiaddr: '/ip4/127.0.0.1/tcp/5001',
  });

  const blockchain = element.blockchain.ethereum.configure({
    mnemonic:
      'hazard pride garment scout search divide solution argue wait avoid title cave',
    hdPath: "m/44'/60'/0'/0/0",
    providerUrl: 'http://localhost:8545',
    anchorContractAddress: '0x1DABA81D326Ae274d5b18111440a05cD9581b305',
  });

  const parameters = {
    maxOperationsPerBatch: 5,
    batchingIntervalInSeconds: 1,
    didMethodName,
    logLevel: 'error',
    mapSync: false,
    maxNumberOfBlocksPerSync: 1000,
  };

  const sidetree = new element.Sidetree({
    db,
    storage,
    blockchain,
    parameters,
  });
  return sidetree;
};

const changeKid = (payload, newKid) => {
  const header = decodeJson(payload.protected);
  const newHeader = {
    ...header,
    kid: newKid,
  };
  return {
    ...payload,
    protected: encodeJson(newHeader),
  };
};

const getDidDocumentForPayload = async (sidetree, payload, didUniqueSuffix) => {
  await sidetree.batchScheduler.writeNow(payload);
  return sidetree.resolve(didUniqueSuffix, true);
};

const getCreatePayloadForKeyIndex = async (sidetree, mks, index) => {
  const primaryKey = await mks.getKeyForPurpose('primary', index);
  const recoveryKey = await mks.getKeyForPurpose('recovery', index);
  const didDocumentModel = sidetree.op.getDidDocumentModel(
    primaryKey.publicKey,
    recoveryKey.publicKey
  );
  return sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
};

const getLastOperation = async (sidetree, didUniqueSuffix) => {
  await sidetree.sync(didUniqueSuffix);
  const operations = await sidetree.db.readCollection(didUniqueSuffix);
  const orderedOperations = sidetree.func.getOrderedOperations(operations);
  const last = orderedOperations.pop();
  return last;
};

const actors = {};

const getActorByIndex = index => {
  return actors[Object.keys(actors)[index]];
};

const generateActors = async (sidetree, count) => {
  // eslint-disable-next-line
  for (let i = 0; i < count; i++) {
    const mks = new element.MnemonicKeySystem(
      element.MnemonicKeySystem.generateMnemonic()
    );
    const primaryKey = mks.getKeyForPurpose('primary', 0);
    const recoveryKey = mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );

    const createPayload = sidetree.op.getCreatePayload(
      didDocumentModel,
      primaryKey
    );
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
        `https://did.example.com/${didMethodName}:${didUniqueSuffix}`,
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

const assertCreateSucceeded = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const did = `${didMethodName}:${actor.didUniqueSuffix}`;
  const didDoc = await sidetree.resolve(did, true);
  expect(didDoc.id).toBe(did);
  expect(didDoc.publicKey[0].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('primary', 0).publicKey
  );
  expect(didDoc.publicKey[1].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('recovery', 0).publicKey
  );
};

const updateByActorIndex = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  // FIXME
  // make sure getPreviousOperationHash will hit cache.
  const { didUniqueSuffix } = getActorByIndex(actorIndex);
  const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
  const newKey = actor.mks.getKeyForPurpose('primary', 10);
  const newPublicKey = {
    id: `${didMethodName}:${didUniqueSuffix}#newKey`,
    usage: 'signing',
    type: 'Secp256k1VerificationKey2018',
    publicKeyHex: newKey.publicKey,
  };
  return sidetree.op.getUpdatePayloadForAddingAKey(
    lastOperation,
    newPublicKey,
    actor.primaryKey.privateKey
  );
};

const recoverByActorIndex = (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const { didUniqueSuffix } = getActorByIndex(actorIndex);
  const newPrimaryPublicKey = actor.mks.getKeyForPurpose('primary', 20)
    .publicKey;
  const newRecoveryPublicKey = actor.mks.getKeyForPurpose('recovery', 20)
    .publicKey;
  const didDocumentModel = sidetree.op.getDidDocumentModel(
    newPrimaryPublicKey,
    newRecoveryPublicKey
  );
  return sidetree.op.getRecoverPayload(
    didUniqueSuffix,
    didDocumentModel,
    actor.recoveryKey.privateKey
  );
};

const assertUpdateSucceeded = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const newKey = actor.mks.getKeyForPurpose('primary', 10);
  const didDoc = await sidetree.resolve(
    `${didMethodName}:${actor.didUniqueSuffix}`,
    true
  );
  expect(didDoc.id).toBe(`${didMethodName}:${actor.didUniqueSuffix}`);
  expect(didDoc.publicKey[2].id).toBe(
    `${didMethodName}:${actor.didUniqueSuffix}#newKey`
  );
  expect(didDoc.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
};

const assertRecoverSucceeded = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const didDoc = await sidetree.resolve(
    `${didMethodName}:${actor.didUniqueSuffix}`,
    true
  );
  expect(didDoc.id).toBe(`${didMethodName}:${actor.didUniqueSuffix}`);
  expect(didDoc.publicKey[0].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('primary', 20).publicKey
  );
  expect(didDoc.publicKey[1].publicKeyHex).toBe(
    actor.mks.getKeyForPurpose('recovery', 20).publicKey
  );
};

// FIXME jit by default
const deactivateByActorIndex = async (sidetree, actorIndex) => {
  const actor = getActorByIndex(actorIndex);
  const { didUniqueSuffix } = getActorByIndex(actorIndex);
  return sidetree.op.getDeletePayload(
    didUniqueSuffix,
    actor.recoveryKey.privateKey
  );
};

const assertDeactivateSucceeded = async (sidetree, actorIndex) => {
  const didDoc = await sidetree.resolve(
    `${didMethodName}:${getActorByIndex(actorIndex).didUniqueSuffix}`,
    true
  );
  expect(didDoc).not.toBeDefined();
};

module.exports = {
  didMethodName,
  didMethodNameWithoutNetworkIdentifier,
  getTestSideTree,
  changeKid,
  getDidDocumentForPayload,
  getCreatePayloadForKeyIndex,
  getLastOperation,
  generateActors,
  getActorByIndex,
  assertCreateSucceeded,
  assertRecoverSucceeded,
  assertUpdateSucceeded,
  deactivateByActorIndex,
  updateByActorIndex,
  assertDeactivateSucceeded,
  recoverByActorIndex,
};
