const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
} = require('../../__tests__/test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

jest.setTimeout(10 * 1000);

describe('json patch updates', () => {
  let mks;
  let primaryKey;
  let recoveryKey;
  let didDocumentModel;
  let createPayload;
  let didUniqueSuffix;

  beforeAll(async () => {
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

  it('should add a new key', async () => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const newKey = mks.getKeyForPurpose('primary', 1);
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
          action: 'ietf-json-patch',
          patches: [
            {
              op: 'add',
              path: '/publicKey/3',
              value: newPublicKey,
            },
          ],
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
    const did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    expect(didDocument.publicKey[2].controller).toBe(didDocument.id);
  });
});
