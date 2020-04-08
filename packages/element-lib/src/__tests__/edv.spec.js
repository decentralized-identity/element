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
  let did;

  it('should create a generic did', async () => {
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
    did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument.id).toBe(did);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
  });

  it('should add the edv payload', async () => {
    const newKey = await element.crypto.ed25519.createKeys();
    const previousOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const keyId = `${did}#edv`;
    const key = {
      id: `${did}#keyAgreement`,
      type: 'X25519KeyAgreementKey2019',
      controller: did,
      publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr',
    };
    const newPublicKey = {
      id: `${did}#edv`,
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
      kid: `${did}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
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
    expect(didDocument.authentication).toEqual([keyId]);
    expect(didDocument.assertionMethod).toEqual([keyId]);
    expect(didDocument.capabilityDelegation).toEqual([keyId]);
    expect(didDocument.capabilityInvocation).toEqual([keyId]);
    expect(didDocument.keyAgreement).toEqual([key]);
  });

  it('should add controller property where necessay', async () => {
    primaryKey = element.crypto.secp256k1.createKeys();
    recoveryKey = element.crypto.secp256k1.createKeys();
    const edvKey = await element.crypto.ed25519.createKeys();
    const keyAgreement = element.crypto.ed25519.X25519KeyPair.fromEdKeyPair({
      publicKeyBase58: edvKey.publicKeyBase58,
    });
    const didDocumentModel = {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          type: 'Secp256k1VerificationKey2018',
          id: '#primary',
          usage: 'signing',
          publicKeyHex: primaryKey.publicKey,
        },
        {
          type: 'Secp256k1VerificationKey2018',
          id: '#recovery',
          usage: 'recovery',
          publicKeyHex: recoveryKey.publicKey,
        },
        {
          type: 'Ed25519VerificationKey2018',
          id: '#edv',
          usage: 'signing',
          publicKeyBase58: edvKey.publicKeyBase58,
        },
      ],
      authentication: ['#edv'],
      assertionMethod: ['#edv'],
      capabilityDelegation: ['#edv'],
      capabilityInvocation: ['#edv'],
      keyAgreement: [
        {
          id: '#keyAgreement',
          type: keyAgreement.type,
          usage: 'signing',
          publicKeyBase58: keyAgreement.publicKeyBase58,
        },
      ],
    };
    expect(didDocumentModel).toBeDefined();
    const createPayload = sidetree.op.getCreatePayload(
      didDocumentModel,
      primaryKey
    );
    const txn = await sidetree.batchScheduler.writeNow(createPayload);
    expect(txn).toBeDefined();
    didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument.publicKey[0].controller).toBe(did);
    expect(didDocument.publicKey[1].controller).toBe(did);
    expect(didDocument.publicKey[2].controller).toBe(did);
    expect(didDocument.keyAgreement[0].controller).toBe(did);
    expect(didDocument.authentication[0]).toBe(`${did}#edv`);
    expect(didDocument.assertionMethod[0]).toBe(`${did}#edv`);
    expect(didDocument.capabilityDelegation[0]).toBe(`${did}#edv`);
    expect(didDocument.capabilityInvocation[0]).toBe(`${did}#edv`);
  });
});
