jest.setTimeout(10 * 1000);

const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
  getActorByIndex,
  generateActors,
} = require('../../__tests__/test-utils');
const protocol = require('./rsa-jwt-needham-schroeder');

let sidetree;
let alice;
let bob;
let Na;
let Nb;

let m0;
let m1;
let m2;

const addRSAKey = async actor => {
  const key = await protocol.generateKey();
  // eslint-disable-next-line
  actor.key = key;
  const { didUniqueSuffix } = actor;
  const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
  const payload = {
    didUniqueSuffix: lastOperation.didUniqueSuffix,
    previousOperationHash: lastOperation.operation.operationHash,
    patches: [
      {
        action: 'add-public-keys',
        publicKeys: [
          {
            id: `${didMethodName}:${actor.didUniqueSuffix}#auth`,
            controller: actor.did,
            usage: 'signing',
            type: 'RsaVerificationKey2018',
            publicKeyPem: key.publicKey,
          },
        ],
      },
    ],
  };
  const header = {
    operation: 'update',
    kid: '#primary',
    alg: 'ES256K',
  };
  const updatePayload = await sidetree.op.makeSignedOperation(
    header,
    payload,
    actor.primaryKey.privateKey
  );
  await sidetree.operationQueue.enqueue(alice.didUniqueSuffix, updatePayload);
  await sidetree.batchWrite();
};

beforeAll(async () => {
  sidetree = getTestSideTree();
  await generateActors(sidetree, 2);
  alice = getActorByIndex(0);
  bob = getActorByIndex(1);
  await sidetree.operationQueue.enqueue(
    alice.didUniqueSuffix,
    alice.createPayload
  );
  await sidetree.operationQueue.enqueue(bob.didUniqueSuffix, bob.createPayload);
  await sidetree.batchWrite();
});

afterAll(async () => {
  await sidetree.close();
});

describe('Needham-Schroeder', () => {
  it('alice and bob have dids', async () => {
    const aliceDidDoc = await sidetree.resolve(alice.didUniqueSuffix, true);
    const bobDidDoc = await sidetree.resolve(bob.didUniqueSuffix, true);
    expect(aliceDidDoc.publicKey.length).toBe(2);
    expect(bobDidDoc.publicKey.length).toBe(2);
  });

  describe('key registration', () => {
    it('alice and bob add keys', async () => {
      await addRSAKey(alice);
      const aliceDidDoc = await sidetree.resolve(alice.didUniqueSuffix, true);
      expect(aliceDidDoc.publicKey.length).toBe(3);
      expect(aliceDidDoc.publicKey[2].type).toBe('RsaVerificationKey2018');
      expect(aliceDidDoc.publicKey[2].publicKeyPem).toBeDefined();

      await addRSAKey(bob);
      const bobDidDoc = await sidetree.resolve(bob.didUniqueSuffix, true);
      expect(bobDidDoc.publicKey.length).toBe(3);
      expect(bobDidDoc.publicKey[2].type).toBe('RsaVerificationKey2018');
      expect(bobDidDoc.publicKey[2].publicKeyPem).toBeDefined();
    });
  });

  describe('protocol', () => {
    it('alice creates Na and encrypts it for bob', async () => {
      const res = await protocol.createM0({
        resolve: sidetree.resolve,
        initiatorDid: alice.didUniqueSuffix,
        responderDid: bob.didUniqueSuffix,
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
        initiatorDid: alice.didUniqueSuffix,
        responderDid: bob.didUniqueSuffix,
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
        initiatorDid: alice.didUniqueSuffix,
        responderDid: bob.didUniqueSuffix,
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
        initiatorDid: alice.didUniqueSuffix,
        responderDid: bob.didUniqueSuffix,
        responderPrivateKey: bob.key.privateKey,
        Nb, // bob knows this, now he can see that alice does as well
      });
      expect(res).toBe(true);
      // Bob has authenticated Alice.
    });
  });
});
