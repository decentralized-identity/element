const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const {
  generateKey,
  // makeToken, encrypt, decrypt, verifyToken,
} = require('./utils');
const getLocalSidetree = require('../__fixtures__/getLocalSidetree');
const element = require('../../../index');

const protocol = require('./rsa-jwt-needham-schroeder');

jest.setTimeout(10 * 1000);

let sidetree;
let alice;
let bob;
let Na;
let Nb;

let m0;
let m1;
let m2;

const makeActor = (mnemonic) => {
  const mks = new element.MnemonicKeySystem(mnemonic);
  const didUniqueSuffix = element.op.getDidUniqueSuffix({
    primaryKey: mks.getKeyForPurpose('primary', 0),
    recoveryPublicKey: mks.getKeyForPurpose('recovery', 0).publicKey,
  });
  return {
    did: `did:elem:${didUniqueSuffix}`,
    didUniqueSuffix,
    mks,
    mnemonic,
  };
};

const addRSAKey = async (actor) => {
  const key = await generateKey();
  // eslint-disable-next-line
  actor.key = key;
  await sidetree.createTransactionFromRequests([
    sidetree.op.update({
      didUniqueSuffix: actor.didUniqueSuffix,
      previousOperationHash: await sidetree.getPreviousOperationHash(actor.didUniqueSuffix),
      patch: [
        {
          op: 'replace',
          path: '/publicKey/2',
          value: {
            id: `${actor.did}#auth`,
            controller: actor.did,
            type: 'RsaVerificationKey2018',
            publicKeyPem: key.publicKey,
          },
        },
      ],
      primaryPrivateKey: actor.mks.getKeyForPurpose('primary', 0).privateKey,
    }),
  ]);
};

beforeAll(async () => {
  sidetree = await getLocalSidetree('Needham-Schroeder');
  // easily generate more.
  // const mnemonic = element.MnemonicKeySystem.generateMnemonic();
  alice = makeActor('lady sweet hurt damp goat rib under riot magnet hobby cross conduct');
  bob = makeActor('present cute rubber purpose scout enjoy arena walnut rival report slogan city');
  await sidetree.createTransactionFromRequests([
    element.op.create({
      primaryKey: alice.mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: alice.mks.getKeyForPurpose('recovery', 0).publicKey,
    }),
    element.op.create({
      primaryKey: bob.mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: bob.mks.getKeyForPurpose('recovery', 0).publicKey,
    }),
  ]);
});

afterAll(async () => {
  await sidetree.close();
});

describe('Needham-Schroeder', () => {
  it('alice and bob have dids', async () => {
    const aliceDidDoc = await sidetree.resolve(alice.did);
    const bobDidDoc = await sidetree.resolve(bob.did);
    expect(aliceDidDoc.publicKey.length).toBe(2);
    expect(bobDidDoc.publicKey.length).toBe(2);
  });

  describe('key registration', () => {
    it('alice and bob add keys', async () => {
      await addRSAKey(alice);
      const aliceDidDoc = await sidetree.resolve(alice.did);
      expect(aliceDidDoc.publicKey.length).toBe(3);

      await addRSAKey(bob);
      const bobDidDoc = await sidetree.resolve(bob.did);
      expect(bobDidDoc.publicKey.length).toBe(3);
    });
  });

  describe('protocol', () => {
    it('alice creates Na and encrypts it for bob', async () => {
      const res = await protocol.createM0({
        resolve: sidetree.resolve,
        initiatorDid: alice.did,
        responderDid: bob.did,
        initiatorPrivateKey: alice.key.privateKey,
      });
      ({ m0, Na } = res);
      expect(m0).toBeDefined();
      expect(Na).toBeDefined();
    });

    it('bob creates Nb and encrypts [Na, Nb, bob.did] for alice', async () => {
      const res = await protocol.createM1({
        m0,
        resolve: sidetree.resolve,
        initiatorDid: alice.did,
        responderDid: bob.did,
        responderPrivateKey: bob.key.privateKey,
      });
      ({ m1, Nb } = res);
      expect(m0).toBeDefined();
      expect(Nb).toBeDefined();
    });
    it('alice decrypts and verifies Na, sends Nb to bob', async () => {
      const res = await protocol.createM2({
        m1,
        resolve: sidetree.resolve,
        initiatorDid: alice.did,
        responderDid: bob.did,
        initiatorPrivateKey: alice.key.privateKey,
        Na, // alice knows this, now she can see that bob does as well
      });
      ({ m2 } = res);
      expect(res.m2).toBeDefined();
      expect(res.Na).toBe(Na);
      expect(res.Nb).toBe(Nb);
    });

    it('bob decrypts and verifies Nb', async () => {
      const res = await protocol.verifyM2({
        m2,
        resolve: sidetree.resolve,
        initiatorDid: alice.did,
        responderDid: bob.did,
        responderPrivateKey: bob.key.privateKey,
        Nb, // bob knows this, now he can see that alice does as well
      });
      expect(res).toBe(true);
      // Bob has authenticated Alice.
    });
  });
});
