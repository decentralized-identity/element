const faker = require('faker');

const getLocalSidetree = require('./__fixtures__/getLocalSidetree');

jest.setTimeout(10 * 1000);

const element = require('../../index');

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('CRUD.Many');
});

afterAll(async () => {
  await sidetree.close();
});

const count = 3;
const actors = {};
const getActorByIndex = index => actors[Object.keys(actors)[index]];

describe('CRUD.Many', () => {
  it('can use fixtures to generate actors', async () => {
    for (let i = 0; i < count; i++) {
      const mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic());
      const didUniqueSuffix = sidetree.op.getDidUniqueSuffix({
        primaryKey: mks.getKeyForPurpose('primary', 0),
        recoveryPublicKey: mks.getKeyForPurpose('recovery', 0).publicKey,
      });
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
        mks,
        didUniqueSuffix,
      };
    }
    expect(Object.keys(actors).length).toBe(count);
  });

  const assertCreateSucceeded = async (actorIndex) => {
    const didDoc = await sidetree.resolve(
      `did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`,
    );
    expect(didDoc.id).toBe(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(
      getActorByIndex(actorIndex).mks.getKeyForPurpose('primary', 0).publicKey,
    );
    expect(didDoc.publicKey[1].publicKeyHex).toBe(
      getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', 0).publicKey,
    );
  };

  const assertRecoverSucceeded = async (actorIndex) => {
    const didDoc = await sidetree.resolve(
      `did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`,
    );
    expect(didDoc.id).toBe(`did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(
      getActorByIndex(actorIndex).mks.getKeyForPurpose('primary', 1).publicKey,
    );
    expect(didDoc.publicKey[1].publicKeyHex).toBe(
      getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', 1).publicKey,
    );
  };

  const assertUpdateSucceeded = async (actorIndex) => {
    const didDoc = await sidetree.resolve(
      `did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`,
    );
    expect(didDoc.service[0].id).toBe('#element.orbitdb');
  };

  const createByActorIndex = actorIndex => sidetree.op.create({
    primaryKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('primary', 0),
    recoveryPublicKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', 0).publicKey,
  });

  const updateByActorIndex = async (actorIndex, version) => sidetree.op.update({
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

  const deactivateByActorIndex = async (actorIndex, version) => sidetree.op.deactivate({
    didUniqueSuffix: getActorByIndex(actorIndex).didUniqueSuffix,
    recoveryPrivateKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', version)
      .privateKey,
  });

  const assertDeactivateSucceeded = async (actorIndex) => {
    const didDoc = await sidetree.resolve(
      `did:elem:${getActorByIndex(actorIndex).didUniqueSuffix}`,
    );
    expect(didDoc.publicKey.length).toBe(0);
  };

  const recoverByActorIndex = async (actorIndex, version) => sidetree.op.recover({
    didUniqueSuffix: getActorByIndex(actorIndex).didUniqueSuffix,
    previousOperationHash: await sidetree.getPreviousOperationHash(
      getActorByIndex(actorIndex).didUniqueSuffix,
    ),
    newPrimaryPublicKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('primary', 1).publicKey,
    newRecoveryPublicKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', 1)
      .publicKey,
    recoveryPrivateKey: getActorByIndex(actorIndex).mks.getKeyForPurpose('recovery', version)
      .privateKey,
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
    await assertCreateSucceeded(0);
    await assertCreateSucceeded(1);

    const txn1 = await sidetree.createTransactionFromRequests([createByActorIndex(2)]);

    await sidetree.sync({
      fromTransactionTime: txn1.transactionTime,
      toTransactionTime: txn1.transactionTime,
    });
    await assertCreateSucceeded(2);
  });

  it('transaction 2 & 3 update, recover', async () => {
    await sidetree.createTransactionFromRequests([
      await updateByActorIndex(0, 0),
      await recoverByActorIndex(1, 0),
    ]);
    await assertUpdateSucceeded(0);
    await assertRecoverSucceeded(1);
    await sidetree.createTransactionFromRequests([
      await updateByActorIndex(1, 1),
      await recoverByActorIndex(0, 0),
    ]);
    await assertUpdateSucceeded(1);
    await assertRecoverSucceeded(0);
  });

  it('transaction 4 & 5 deactivate', async () => {
    await sidetree.createTransactionFromRequests([
      await deactivateByActorIndex(0, 1),
      await deactivateByActorIndex(2, 0),
    ]);
    await assertDeactivateSucceeded(0);
    await assertDeactivateSucceeded(2);
    await sidetree.createTransactionFromRequests([await deactivateByActorIndex(1, 1)]);
    await assertDeactivateSucceeded(1);
  });
});
