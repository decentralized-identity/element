const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
} = require('../../__tests__/test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

jest.setTimeout(20 * 1000);

describe('json patch updates', () => {
  let mks;
  let primaryKey;
  let recoveryKey;
  let didDocumentModel;
  let createPayload;
  let didUniqueSuffix;

  beforeEach(async () => {
    mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    primaryKey = mks.getKeyForPurpose('primary', 0);
    recoveryKey = mks.getKeyForPurpose('recovery', 0);
    didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    createPayload = sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    await sidetree.batchScheduler.writeNow(createPayload);
  });

  const makeUpdate = async patches => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'ietf-json-patch',
          patches,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${lastOperation.didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const sidetreeOp = await sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    await sidetree.batchScheduler.writeNow(sidetreeOp);
  };

  it('should add / remove public key', async () => {
    const newKey = mks.getKeyForPurpose('primary', 1);
    await makeUpdate([
      {
        op: 'add',
        path: '/publicKey/2',
        value: {
          id: `${didMethodName}:${didUniqueSuffix}#newKey`,
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: newKey.publicKey,
        },
      },
    ]);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    let didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    expect(didDocument.publicKey[2].controller).toBe(didDocument.id);

    await makeUpdate([
      {
        op: 'remove',
        path: '/publicKey/2',
      },
    ]);
    didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.publicKey).toHaveLength(2);
  });

  it('should add / remove service endpoint', async () => {
    await makeUpdate([
      {
        op: 'add',
        path: '/service',
        value: [
          {
            id: '#endpoint1',
            type: 'UserServiceEndpoint',
            serviceEndpoint: 'https://example.com',
          },
        ],
      },
    ]);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    let didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.service).toHaveLength(1);

    await makeUpdate([
      {
        op: 'remove',
        path: '/service',
      },
    ]);
    didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.service).not.toBeDefined();
  });

  it('should support multiple patches', async () => {
    const newKey = mks.getKeyForPurpose('primary', 1);
    await makeUpdate([
      {
        op: 'add',
        path: '/publicKey/2',
        value: {
          id: `${didMethodName}:${didUniqueSuffix}#newKey`,
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: newKey.publicKey,
        },
      },
      {
        op: 'add',
        path: '/service',
        value: [
          {
            id: '#endpoint1',
            type: 'UserServiceEndpoint',
            serviceEndpoint: 'https://example.com',
          },
        ],
      },
    ]);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    expect(didDocument.publicKey[2].controller).toBe(didDocument.id);
    expect(didDocument.service).toHaveLength(1);
  });

  it('should support infering patches', async () => {
    const did = `${didMethodName}:${didUniqueSuffix}`;
    let didDocument = await sidetree.resolve(did, true);
    const newDidDocument = {
      ...didDocument,
      publicKey: [didDocument.publicKey[0]],
      service: [
        {
          id: '#endpoint1',
          type: 'UserServiceEndpoint',
          serviceEndpoint: 'https://example.com',
        },
      ],
    };
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const sidetreeOp = await sidetree.op.getUpdatePayload(
      lastOperation,
      didDocument,
      newDidDocument,
      primaryKey.privateKey
    );
    await sidetree.batchScheduler.writeNow(sidetreeOp);
    didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.publicKey).toHaveLength(1);
    expect(didDocument.service).toHaveLength(1);
    expect(didDocument).toEqual(
      sidetree.func.toFullyQualifiedDidDocument(newDidDocument)
    );
  });
});
