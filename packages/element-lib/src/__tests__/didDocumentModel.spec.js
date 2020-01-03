const { getTestSideTree } = require('./test-utils');

const sidetree = getTestSideTree();
const element = require('../../index');

describe('DID Document model', () => {
  it('should support secp256k1 keys', async () => {
    const primaryKey = await element.crypto.secp256k1.createKeys();
    const recoveryKey = await element.crypto.secp256k1.createKeys();
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey, recoveryKey.publicKey,
    );
    const createPayload = await sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    const txn = await sidetree.batchScheduler.writeNow(createPayload);
    expect(txn).toBeDefined();
    const didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    const did = `did:elem:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument.id).toBe(did);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
  });

  it('should support ed25519 keys', async () => {

  });
});
