const { getTestSideTree, getLastOperation } = require('./test-utils');

const sidetree = getTestSideTree();
const element = require('../../index');

describe('DID Document model', () => {
  let primaryKey;
  let recoveryKey;
  let didUniqueSuffix;

  it('should create a generic did', async () => {
    primaryKey = await element.crypto.secp256k1.createKeys();
    recoveryKey = await element.crypto.secp256k1.createKeys();
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey, recoveryKey.publicKey,
    );
    const createPayload = await sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    const txn = await sidetree.batchScheduler.writeNow(createPayload);
    expect(txn).toBeDefined();
    didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    const did = `did:elem:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument.id).toBe(did);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
  });

  it('should add the edv payload', async () => {
    const newKey = await element.crypto.ed25519.createKeys();
    const previousOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const did = `did:elem:${didUniqueSuffix}`;
    const keyId = `${did}#edv`;
    const key = {
      id: `${did}#keyAgreement`,
      type: 'X25519KeyAgreementKey2019',
      controller: did,
      publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr',
    };
    const newPublicKey = {
      id: '#edv',
      usage: 'signing',
      type: 'Ed25519VerificationKey2018',
      publicKeyBase58: newKey.publicKeyBase58,
    };
    const addPublicKeyPatch = {
      action: 'add-public-keys',
      publicKeys: [newPublicKey],
    };
    const addAuthenticationPatch = {
      action: 'add-authentication',
      verificationMethod: keyId,
    };
    const addAssertionMethodPatch = {
      action: 'add-assertion-method',
      verificationMethod: keyId,
    };
    const addCapabilityDelegationPatch = {
      action: 'add-capability-delegation',
      verificationMethod: keyId,
    };
    const addCapabilityInvocationPatch = {
      action: 'add-capability-invocation',
      verificationMethod: keyId,
    };
    const addKeyAgreementPatch = {
      action: 'add-key-agreement',
      verificationMethod: key,
    };
    const payload = {
      didUniqueSuffix: previousOperation.didUniqueSuffix,
      previousOperationHash: previousOperation.operation.operationHash,
      patches: [
        addPublicKeyPatch,
        addAuthenticationPatch,
        addAssertionMethodPatch,
        addCapabilityDelegationPatch,
        addCapabilityInvocationPatch,
        addKeyAgreementPatch,
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(header, payload, primaryKey.privateKey);
    const txn = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(txn).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    expect(didDocument.publicKey[2].publicKeyBase58).toBe(newKey.publicKeyBase58);
    expect(didDocument.authentication).toEqual([keyId]);
    expect(didDocument.assertionMethod).toEqual([keyId]);
    expect(didDocument.capabilityDelegation).toEqual([keyId]);
    expect(didDocument.capabilityInvocation).toEqual([keyId]);
    expect(didDocument.keyAgreement).toEqual([key]);
  });
});
