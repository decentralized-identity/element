const batchWrite = require('./batchWrite');
const {
  didMethodName,
  getTestSideTree,
  getCreatePayloadForKeyIndex,
} = require('../../__tests__/test-utils');
const {
  batchFileToOperations,
  getDidUniqueSuffix,
  decodeJson,
} = require('../../func');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

jest.setTimeout(10 * 1000);

describe('batchWrite with one operation', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
  let createPayload;
  let transaction;
  let anchorFile;
  let didUniqueSuffix;
  let batchFile;

  beforeAll(async () => {
    const primaryKey = mks.getKeyForPurpose('primary', 0);
    const recoveryKey = mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    createPayload = sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    didUniqueSuffix = getDidUniqueSuffix(createPayload);
    await sidetree.operationQueue.enqueue(didUniqueSuffix, createPayload);
    transaction = await batchWrite(sidetree)();
  });

  it('should anchor an anchorFileHash to Ethereum', async () => {
    expect(transaction.anchorFileHash).toBeDefined();
  });

  it('should publish anchorFile to IPFS', async () => {
    anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    expect(anchorFile.batchFileHash).toBeDefined();
    expect(anchorFile.didUniqueSuffixes).toEqual([didUniqueSuffix]);
    expect(anchorFile.merkleRoot).toBeDefined();
  });

  it('should publish batchFile to IPFS', async () => {
    batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
    expect(batchFile.operations).toBeDefined();
  });

  it('should contain the correct operation', async () => {
    const operations = batchFileToOperations(batchFile);
    expect(operations).toHaveLength(1);
    expect(operations[0].decodedOperation).toEqual(createPayload);
    expect(operations[0].operationHash).toEqual(didUniqueSuffix);
  });

  it('should not return the did before sync is called', async () => {
    const didDocument = await sidetree.resolve(didUniqueSuffix, false);
    expect(didDocument).not.toBeDefined();
  });

  it('should resolve the did when the observer synced the transaction', async () => {
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    expect(didDocument.id).toBe(did);
    const decodedPayload = decodeJson(createPayload.payload);
    expect(didDocument['@context']).toBe(decodedPayload['@context']);
    expect(didDocument.publicKey[0]).toEqual({
      ...decodedPayload.publicKey[0],
      id: didDocument.id + decodedPayload.publicKey[0].id,
      controller: didDocument.id,
    });
    expect(didDocument.publicKey[1]).toEqual({
      ...decodedPayload.publicKey[1],
      id: didDocument.id + decodedPayload.publicKey[1].id,
      controller: didDocument.id,
    });
  });
});

describe('batchWrite with several operations', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
  let createPayload1;
  let createPayload2;
  let didUniqueSuffix1;
  let didUniqueSuffix2;
  let transaction;
  let anchorFile;
  let batchFile;

  beforeAll(async () => {
    createPayload1 = await getCreatePayloadForKeyIndex(sidetree, mks, 0);
    createPayload2 = await getCreatePayloadForKeyIndex(sidetree, mks, 1);
    didUniqueSuffix1 = getDidUniqueSuffix(createPayload1);
    didUniqueSuffix2 = getDidUniqueSuffix(createPayload2);
  });

  it('should submit a batched transaction', async () => {
    await sidetree.operationQueue.enqueue(didUniqueSuffix1, createPayload1);
    await sidetree.operationQueue.enqueue(didUniqueSuffix2, createPayload2);
    transaction = await batchWrite(sidetree)();
    expect(transaction.anchorFileHash).toBeDefined();
  });

  it('should publish anchorFile to IPFS', async () => {
    anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    expect(anchorFile.batchFileHash).toBeDefined();
    expect(anchorFile.didUniqueSuffixes).toEqual([
      didUniqueSuffix1,
      didUniqueSuffix2,
    ]);
    expect(anchorFile.merkleRoot).toBeDefined();
  });

  it('should publish batchFile to IPFS', async () => {
    batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
    expect(batchFile.operations).toBeDefined();
  });

  it('should contain the correct operations', async () => {
    const operations = batchFileToOperations(batchFile);
    expect(operations).toHaveLength(2);
    expect(operations[0].decodedOperation).toEqual(createPayload1);
    expect(operations[1].decodedOperation).toEqual(createPayload2);
  });

  it('should not return the did before sync is called', async () => {
    const didDocument1 = await sidetree.resolve(didUniqueSuffix1, false);
    expect(didDocument1).not.toBeDefined();
    const didDocument2 = await sidetree.resolve(didUniqueSuffix2, false);
    expect(didDocument2).not.toBeDefined();
  });

  it('should resolve the first did when the observer synced the transaction', async () => {
    const didDocument = await sidetree.resolve(didUniqueSuffix1, true);
    const did = `${didMethodName}:${didUniqueSuffix1}`;
    expect(didDocument.id).toBe(did);
    const decodedPayload = decodeJson(createPayload1.payload);
    expect(didDocument['@context']).toBe(decodedPayload['@context']);
    expect(didDocument.publicKey[0]).toEqual({
      ...decodedPayload.publicKey[0],
      id: didDocument.id + decodedPayload.publicKey[0].id,
      controller: didDocument.id,
    });
    expect(didDocument.publicKey[1]).toEqual({
      ...decodedPayload.publicKey[1],
      id: didDocument.id + decodedPayload.publicKey[1].id,
      controller: didDocument.id,
    });
  });

  it('should resolve the second did when the observer synced the transaction', async () => {
    const didDocument = await sidetree.resolve(didUniqueSuffix2, true);
    const did = `${didMethodName}:${didUniqueSuffix2}`;
    expect(didDocument.id).toBe(did);
    const decodedPayload = decodeJson(createPayload2.payload);
    expect(didDocument['@context']).toBe(decodedPayload['@context']);
    expect(didDocument.publicKey[0]).toEqual({
      ...decodedPayload.publicKey[0],
      id: didDocument.id + decodedPayload.publicKey[0].id,
      controller: didDocument.id,
    });
    expect(didDocument.publicKey[1]).toEqual({
      ...decodedPayload.publicKey[1],
      id: didDocument.id + decodedPayload.publicKey[1].id,
      controller: didDocument.id,
    });
  });
});

describe('batchWrite with more operations than maxOperationsPerBatch', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
  let createPayload1;
  let createPayload2;
  let createPayload3;
  let createPayload4;
  let createPayload5;
  let createPayload6;
  let didUniqueSuffix1;
  let didUniqueSuffix2;
  let didUniqueSuffix3;
  let didUniqueSuffix4;
  let didUniqueSuffix5;
  let didUniqueSuffix6;
  let transaction;
  let anchorFile;
  let batchFile;

  beforeAll(async () => {
    createPayload1 = await getCreatePayloadForKeyIndex(sidetree, mks, 0);
    createPayload2 = await getCreatePayloadForKeyIndex(sidetree, mks, 1);
    createPayload3 = await getCreatePayloadForKeyIndex(sidetree, mks, 3);
    createPayload4 = await getCreatePayloadForKeyIndex(sidetree, mks, 4);
    createPayload5 = await getCreatePayloadForKeyIndex(sidetree, mks, 5);
    createPayload6 = await getCreatePayloadForKeyIndex(sidetree, mks, 6);
    didUniqueSuffix1 = getDidUniqueSuffix(createPayload1);
    didUniqueSuffix2 = getDidUniqueSuffix(createPayload2);
    didUniqueSuffix3 = getDidUniqueSuffix(createPayload3);
    didUniqueSuffix4 = getDidUniqueSuffix(createPayload4);
    didUniqueSuffix5 = getDidUniqueSuffix(createPayload5);
    didUniqueSuffix6 = getDidUniqueSuffix(createPayload6);
    await sidetree.operationQueue.enqueue(didUniqueSuffix1, createPayload1);
    await sidetree.operationQueue.enqueue(didUniqueSuffix2, createPayload2);
    await sidetree.operationQueue.enqueue(didUniqueSuffix3, createPayload3);
    await sidetree.operationQueue.enqueue(didUniqueSuffix4, createPayload4);
    await sidetree.operationQueue.enqueue(didUniqueSuffix5, createPayload5);
    await sidetree.operationQueue.enqueue(didUniqueSuffix6, createPayload6);
  });

  it('should only include 5 operations in next batch', async () => {
    transaction = await batchWrite(sidetree)();
    expect(transaction.anchorFileHash).toBeDefined();
    anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
    const operations = batchFileToOperations(batchFile);
    expect(operations).toHaveLength(5);
    expect(operations[0].decodedOperation).toEqual(createPayload1);
    expect(operations[1].decodedOperation).toEqual(createPayload2);
    expect(operations[2].decodedOperation).toEqual(createPayload3);
    expect(operations[3].decodedOperation).toEqual(createPayload4);
    expect(operations[4].decodedOperation).toEqual(createPayload5);
  });

  it('should batch the remaining transaction', async () => {
    transaction = await batchWrite(sidetree)();
    expect(transaction.anchorFileHash).toBeDefined();
    anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
    const operations = batchFileToOperations(batchFile);
    expect(operations).toHaveLength(1);
    expect(operations[0].decodedOperation).toEqual(createPayload6);
  });
});
