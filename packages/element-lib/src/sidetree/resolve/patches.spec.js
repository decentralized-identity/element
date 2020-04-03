const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
} = require('../../__tests__/test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

jest.setTimeout(10 * 1000);

describe('patches', () => {
  let mks;
  let primaryKey;
  let recoveryKey;
  let didUniqueSuffix;
  let did;
  let createPayload;
  let keyId;

  beforeAll(async () => {
    mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    primaryKey = mks.getKeyForPurpose('primary', 0);
    recoveryKey = mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    createPayload = sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    didUniqueSuffix = await sidetree.func.getDidUniqueSuffix(createPayload);
    did = `${didMethodName}${didUniqueSuffix}`;
    await sidetree.batchScheduler.writeNow(createPayload);
  });

  it('should add a new key', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const newKey = await mks.getKeyForPurpose('primary', 1);
    const newPublicKey = {
      id: `${didMethodName}:${didUniqueSuffix}#newKey`,
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
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    keyId = `${didMethodName}:${didUniqueSuffix}#newKey`;
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
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.authentication).toEqual([keyId]);
  });

  it('should remove an authentication method', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'remove-authentication',
          id: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.authentication).toEqual([]);
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
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.assertionMethod).toEqual([keyId]);
  });

  it('should remove an assertion method', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'remove-assertion-method',
          id: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.assertionMethod).toEqual([]);
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
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.capabilityDelegation).toEqual([keyId]);
  });

  it('should remove a capability delegation', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'remove-capability-delegation',
          id: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.capabilityDelegation).toEqual([]);
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
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.capabilityInvocation).toEqual([keyId]);
  });

  it('should remove a capability invocation', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'remove-capability-invocation',
          id: keyId,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.capabilityInvocation).toEqual([]);
  });

  it('should add a key agreement method', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const key = {
      id: `${did}#keyAgreement`,
      type: 'X25519KeyAgreementKey2019',
      controller: did,
      publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr',
    };
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-key-agreement',
          verificationMethod: key,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.keyAgreement).toEqual([key]);
  });

  it('should remove a key agreement method', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'remove-key-agreement',
          id: `${did}#keyAgreement`,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.keyAgreement).toEqual([]);
  });

  it('should add a service endpoint', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const endpoint = {
      id: '#endpoint1',
      type: 'UserServiceEndpoint',
      serviceEndpoint: 'https://example.com',
    };
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-service-endpoint',
          ...endpoint,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.service).toEqual([
      { ...endpoint, id: `${didMethodName}:${didUniqueSuffix}${endpoint.id}` },
    ]);
  });

  it('should remove a service endpoint', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'remove-service-endpoint',
          id: '#endpoint1',
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    const transaction = await sidetree.batchScheduler.writeNow(updatePayload);
    expect(transaction).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.service).toEqual([]);
  });
});
