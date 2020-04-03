const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
} = require('./test-utils');

const sidetree = getTestSideTree();
const element = require('../../index');

jest.setTimeout(10 * 1000);

describe('DID Document model', () => {
  let primaryKey;
  let recoveryKey;
  let didUniqueSuffix;

  it('should support secp256k1 keys', async () => {
    primaryKey = element.crypto.secp256k1.createKeys();
    recoveryKey = element.crypto.secp256k1.createKeys();
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    const createPayload = sidetree.op.getCreatePayload(
      didDocumentModel,
      primaryKey
    );
    const txn = await sidetree.batchScheduler.writeNow(createPayload);
    expect(txn).toBeDefined();
    didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument.id).toBe(did);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
  });

  it('should support adding a ed25519 key', async () => {
    const newKey = await element.crypto.ed25519.createKeys();
    const previousOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const newPublicKey = {
      id: '#newKey',
      usage: 'signing',
      type: 'Ed25519VerificationKey2018',
      publicKeyBase58: newKey.publicKeyBase58,
    };
    const updatePayload = sidetree.op.getUpdatePayloadForAddingAKey(
      previousOperation,
      newPublicKey,
      primaryKey.privateKey
    );
    const txn = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(txn).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    expect(didDocument.publicKey[2].publicKeyBase58).toBe(
      newKey.publicKeyBase58
    );
  });
});
