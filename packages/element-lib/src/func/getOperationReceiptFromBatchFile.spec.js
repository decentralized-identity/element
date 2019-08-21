const element = require('../../index');

const {
  aliceCreateBatchFile,
  aliceCreateAnchorFile,
  aliceEncodedCreateOp,
  storage,
  blockchain,
} = require('../__tests__/__fixtures__');

const createFromKeypair = (publicKey, privateKey) => {
  const payload = {
    '@context': 'https://w3id.org/did/v1',
    publicKey: [
      {
        id: '#key1',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: publicKey,
      },
    ],
  };
  const encodedPayload = element.func.encodeJson(payload);
  const signature = element.func.signEncodedPayload(encodedPayload, privateKey);
  const requestBody = {
    header: {
      operation: 'create',
      kid: '#key1',
      alg: 'ES256K',

    },
    payload: encodedPayload,
    signature,
  };

  return element.func.requestBodyToEncodedOperation({
    ...requestBody,
  });
};

describe('getOperationReceiptFromBatchFile', () => {
  it('should return a base64Url encoded merkle proof receipt', async () => {
    const receipt = await element.func.getOperationReceiptFromBatchFile({
      batchFile: aliceCreateBatchFile,
      operation: aliceEncodedCreateOp,
    });
    expect(receipt).toBe('W10');
  });

  it('should work with verify with 1 op', async () => {
    const receipt = await element.func.getOperationReceiptFromBatchFile({
      batchFile: aliceCreateBatchFile,
      operation: aliceEncodedCreateOp,
    });

    const included = await element.func.verifyOperationInclusion({
      receipt,
      merkleRoot: aliceCreateAnchorFile.merkleRoot,
      operation: aliceEncodedCreateOp,
    });

    expect(included).toBe(true);
  });

  it('should work with verify with 2 op', async () => {
    // not implemented

    const aliceKeys = await element.func.createKeys();
    const createAlice = createFromKeypair(aliceKeys.publicKey, aliceKeys.privateKey);

    const bobKeys = await element.func.createKeys();
    const createBob = createFromKeypair(bobKeys.publicKey, bobKeys.privateKey);

    const txn = await element.func.operationsToTransaction({
      operations: [createAlice, createBob],
      storage,
      blockchain,
    });

    const anchorFile = await storage.read(txn.anchorFileHash);

    const batchFile = await storage.read(anchorFile.batchFileHash);

    let receipt = await element.func.getOperationReceiptFromBatchFile({
      batchFile,
      operation: createAlice,
    });

    let included = await element.func.verifyOperationInclusion({
      receipt,
      merkleRoot: anchorFile.merkleRoot,
      operation: createAlice,
    });

    expect(included).toBe(true);

    receipt = await element.func.getOperationReceiptFromBatchFile({
      batchFile,
      operation: createBob,
    });

    included = await element.func.verifyOperationInclusion({
      receipt,
      merkleRoot: anchorFile.merkleRoot,
      operation: createBob,
    });

    expect(included).toBe(true);
  });
});
