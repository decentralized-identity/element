const getLocalSidetree = require('./__fixtures__/getLocalSidetree');

jest.setTimeout(10 * 1000);

const element = require('../../index');

let sidetree;
let didUniqueSuffix;
const alice = { name: 'alice', type: 'actor' };

beforeAll(async () => {
  sidetree = await getLocalSidetree('CRUD.One');
  alice.mks = new element.MnemonicKeySystem(
    'category copy escape scan type news bird awake affair base mansion favorite',
  );
  alice.did = 'did:elem:-GDpY-poe_gLelwiR-wPmPhv1nEzi-bmJNpdgvUO9S0';
  alice.didUniqueSuffix = '-GDpY-poe_gLelwiR-wPmPhv1nEzi-bmJNpdgvUO9S0';
  await sidetree.sleep(1);
});

afterAll(async () => {
  await sidetree.close();
});

describe('CRUD.One', () => {
  it('create', async () => {
    const txn = await sidetree.createTransactionFromRequests(
      sidetree.op.create({
        primaryKey: alice.mks.getKeyForPurpose('primary', 0),
        recoveryPublicKey: alice.mks.getKeyForPurpose('recovery', 0).publicKey,
      }),
    );
    await sidetree.sync({
      fromTransactionTime: txn.transactionTime,
      toTransactionTime: txn.transactionTime,
    });
    const [docRecord] = await sidetree.db.readCollection('element:sidetree:did:documentRecord');
    didUniqueSuffix = docRecord.record.previousOperationHash;
    expect(
      sidetree.op.getDidUniqueSuffix({
        primaryKey: alice.mks.getKeyForPurpose('primary', 0),
        recoveryPublicKey: alice.mks.getKeyForPurpose('recovery', 0).publicKey,
      }),
    ).toBe(didUniqueSuffix);
    const didDoc = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
    expect(didDoc.id).toBe(`did:elem:${didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('primary', 0).publicKey,
    );
    expect(didDoc.publicKey[1].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('recovery', 0).publicKey,
    );
  });

  it('recover', async () => {
    await sidetree.createTransactionFromRequests(
      sidetree.op.recover({
        didUniqueSuffix: alice.didUniqueSuffix,
        previousOperationHash: await sidetree.getPreviousOperationHash(alice.didUniqueSuffix),
        newPrimaryPublicKey: alice.mks.getKeyForPurpose('primary', 1).publicKey,
        newRecoveryPublicKey: alice.mks.getKeyForPurpose('recovery', 1).publicKey,
        recoveryPrivateKey: alice.mks.getKeyForPurpose('recovery', 0).privateKey,
      }),
    );
    const didDoc = await sidetree.resolve(`did:elem:${alice.didUniqueSuffix}`);
    expect(didDoc.id).toBe(`did:elem:${didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('primary', 1).publicKey,
    );
    expect(didDoc.publicKey[1].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('recovery', 1).publicKey,
    );
  });

  it('update', async () => {
    await sidetree.createTransactionFromRequests(
      sidetree.op.update({
        didUniqueSuffix: alice.didUniqueSuffix,
        previousOperationHash: await sidetree.getPreviousOperationHash(alice.didUniqueSuffix),
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
        primaryPrivateKey: alice.mks.getKeyForPurpose('primary', 1).privateKey,
      }),
    );
    const didDoc = await sidetree.resolve(`did:elem:${alice.didUniqueSuffix}`);
    expect(didDoc.service[0].id).toBe('#element.orbitdb');
  });

  it('deactivate', async () => {
    await sidetree.createTransactionFromRequests(
      sidetree.op.deactivate({
        didUniqueSuffix: alice.didUniqueSuffix,
        recoveryPrivateKey: alice.mks.getKeyForPurpose('recovery', 1).privateKey,
      }),
    );
    const didDoc = await sidetree.resolve(`did:elem:${alice.didUniqueSuffix}`);
    expect(didDoc.publicKey.length).toBe(0);
  });
});
