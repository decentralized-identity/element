const {
  getTestSideTree,
  getLastOperation,
} = require('../../__tests__/test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

describe('patches', () => {
  let mks;
  let primaryKey;
  let recoveryKey;
  let didUniqueSuffix;
  let createPayload;
  let keyId;

  beforeAll(async () => {
    mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    primaryKey = await mks.getKeyForPurpose('primary', 0);
    recoveryKey = await mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = await sidetree.op.getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
    createPayload = await await sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    didUniqueSuffix = await sidetree.func.getDidUniqueSuffix(createPayload);
    const createTransaction = await sidetree.batchScheduler.writeNow(createPayload);
    await sidetree.syncTransaction(createTransaction);
  });

  it('should add a new key', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const newKey = await mks.getKeyForPurpose('primary', 1);
    const newPublicKey = {
      id: '#newKey',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: newKey.publicKey,
    };
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-public-keys',
          publicKeys: [newPublicKey],
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(header, payload, primaryKey.privateKey);
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    keyId = `did:elem${didUniqueSuffix}#newKey`;
  });

  it('should add an authentication method', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-authentication',
          verificationMethod: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(header, payload, primaryKey.privateKey);
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.authentication).toEqual([keyId]);
  });

  it('should add an assertion method', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-assertion-method',
          verificationMethod: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(header, payload, primaryKey.privateKey);
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.assertionMethod).toEqual([keyId]);
  });

  it('should add a capability delegation', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-capability-delegation',
          verificationMethod: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(header, payload, primaryKey.privateKey);
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.capabilityDelegation).toEqual([keyId]);
  });

  it('should add a capability invocation', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-capability-invocation',
          verificationMethod: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(header, payload, primaryKey.privateKey);
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.capabilityInvocation).toEqual([keyId]);
  });

  it('should add a key agreement method', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-key-agreement',
          verificationMethod: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(header, payload, primaryKey.privateKey);
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.keyAgreement).toEqual([keyId]);
  });
});
