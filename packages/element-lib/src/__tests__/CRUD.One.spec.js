const { getTestSideTree } = require('./test-utils');

jest.setTimeout(10 * 1000);

const element = require('../../index');

const sidetree = getTestSideTree();
const alice = { name: 'alice', type: 'actor' };
alice.mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic());

afterAll(async () => {
  await sidetree.close();
});

describe('CRUD.One', () => {
  it('create', async () => {
    const alicePrimaryKey = alice.mks.getKeyForPurpose('primary', 0);
    const aliceRecoveryKey = alice.mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      alicePrimaryKey.publicKey, aliceRecoveryKey.publicKey,
    );
    const createPayload = await sidetree.op.getCreatePayload(didDocumentModel, alicePrimaryKey);
    alice.didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    const txn = await sidetree.batchScheduler.writeNow(createPayload);
    expect(txn).toBeDefined();
    const didDoc = await sidetree.resolve(`did:elem:${alice.didUniqueSuffix}`, true);
    expect(didDoc.id).toBe(`did:elem:${alice.didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('primary', 0).publicKey,
    );
    expect(didDoc.publicKey[1].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('recovery', 0).publicKey,
    );
  });

  it('recover', async () => {
    const aliceRecoveryKey = alice.mks.getKeyForPurpose('recovery', 0);
    const newPrimaryPublicKey = alice.mks.getKeyForPurpose('primary', 1).publicKey;
    const newRecoveryPublicKey = alice.mks.getKeyForPurpose('recovery', 1).publicKey;
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      newPrimaryPublicKey, newRecoveryPublicKey,
    );
    const recoverPayload = await sidetree.op.getRecoverPayload(
      alice.didUniqueSuffix, didDocumentModel, aliceRecoveryKey.privateKey,
    );
    const txn = await sidetree.batchScheduler.writeNow(recoverPayload);
    expect(txn).toBeDefined();
    const didDoc = await sidetree.resolve(`did:elem:${alice.didUniqueSuffix}`, true);
    expect(didDoc.id).toBe(`did:elem:${alice.didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('primary', 1).publicKey,
    );
    expect(didDoc.publicKey[1].publicKeyHex).toBe(
      alice.mks.getKeyForPurpose('recovery', 1).publicKey,
    );
  });

  // it('update', async () => {
  //   await sidetree.createTransactionFromRequests(
  //     sidetree.op.update({
  //       didUniqueSuffix: alice.didUniqueSuffix,
  //       previousOperationHash: await sidetree.getPreviousOperationHash(alice.didUniqueSuffix),
  //       patch: [
  //         {
  //           op: 'replace',
  //           path: '/service',
  //           value: [
  //             {
  //               id: '#element.orbitdb',
  //               type: 'OrbitDB.PublicAttestationStore',
  //               serviceEndpoint:
  //                 'https://api.example.com/orbitdb/QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43',
  //             },
  //           ],
  //         },
  //       ],
  //       primaryPrivateKey: alice.mks.getKeyForPurpose('primary', 1).privateKey,
  //     }),
  //   );
  //   const didDoc = await sidetree.resolve(`did:elem:${alice.didUniqueSuffix}`);
  //   expect(didDoc.service[0].id).toBe('#element.orbitdb');
  // });

  // it('deactivate', async () => {
  //   await sidetree.createTransactionFromRequests(
  //     sidetree.op.deactivate({
  //       didUniqueSuffix: alice.didUniqueSuffix,
  //       recoveryPrivateKey: alice.mks.getKeyForPurpose('recovery', 1).privateKey,
  //     }),
  //   );
  //   const didDoc = await sidetree.resolve(`did:elem:${alice.didUniqueSuffix}`);
  //   expect(didDoc.publicKey.length).toBe(0);
  // });
});
