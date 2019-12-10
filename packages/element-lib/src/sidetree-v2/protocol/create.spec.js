const create = require('./create');
const resolve = require('./resolve');
const { getTestSideTree } = require('../test-utils');
const { getDidDocumentModel, getCreatePayload } = require('../op');
const {
  batchFileToOperations,
  getDidUniqueSuffix,
  decodeJson,
  syncTransaction,
} = require('../func');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

describe('create', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
  let createPayload;
  let transaction;
  let anchorFile;
  let didUniqueSuffix;
  let batchFile;

  beforeAll(async () => {
    const primaryKey = await mks.getKeyForPurpose('primary', 0);
    const recoveryKey = await mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
    createPayload = await getCreatePayload(didDocumentModel, primaryKey);
    transaction = await create(sidetree)(createPayload);
  });

  it('should anchor an anchorFileHash to Ethereum', async () => {
    expect(transaction.anchorFileHash).toBeDefined();
  });

  it('should publish anchorFile to IPFS', async () => {
    anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    expect(anchorFile.batchFileHash).toBeDefined();
    didUniqueSuffix = getDidUniqueSuffix(createPayload);
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
  });

  it('should not return the did before sync is called', async () => {
    const didDocument = await resolve(sidetree)(didUniqueSuffix);
    expect(didDocument).not.toBeDefined();
  });

  it('should resolve the did when the observer synced the transaction', async () => {
    await syncTransaction(sidetree, transaction);
    const didDocument = await resolve(sidetree)(didUniqueSuffix);
    const did = `did:elem:${didUniqueSuffix}`;
    expect(didDocument.id).toBe(did);
    const decodedPayload = decodeJson(createPayload.payload);
    expect(didDocument['@context']).toBe(decodedPayload['@context']);
    expect(didDocument.publicKey).toEqual(decodedPayload.publicKey);
  });
});

describe('create batch', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
  let createPayload1;
  let createPayload2;
  let didUniqueSuffix1;
  let didUniqueSuffix2;
  let batch;
  let transaction;
  let anchorFile;
  let batchFile;

  const getPayloadForKeyIndex = async (index) => {
    const primaryKey = await mks.getKeyForPurpose('primary', index);
    const recoveryKey = await mks.getKeyForPurpose('recovery', index);
    const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
    return getCreatePayload(didDocumentModel, primaryKey);
  };

  beforeAll(async () => {
    createPayload1 = await getPayloadForKeyIndex(0);
    createPayload2 = await getPayloadForKeyIndex(1);
    didUniqueSuffix1 = getDidUniqueSuffix(createPayload1);
    didUniqueSuffix2 = getDidUniqueSuffix(createPayload2);
    batch = [createPayload1, createPayload2];
  });

  it('should submit a batched transaction', async () => {
    transaction = await create(sidetree)(batch);
    expect(transaction.anchorFileHash).toBeDefined();
  });

  it('should publish anchorFile to IPFS', async () => {
    anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    expect(anchorFile.batchFileHash).toBeDefined();
    expect(anchorFile.didUniqueSuffixes).toEqual([didUniqueSuffix1, didUniqueSuffix2]);
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
    const didDocument1 = await resolve(sidetree)(didUniqueSuffix1);
    expect(didDocument1).not.toBeDefined();
    const didDocument2 = await resolve(sidetree)(didUniqueSuffix2);
    expect(didDocument2).not.toBeDefined();
  });

  it('should resolve the first did when the observer synced the transaction', async () => {
    await syncTransaction(sidetree, transaction);
    const didDocument = await resolve(sidetree)(didUniqueSuffix1);
    const did = `did:elem:${didUniqueSuffix1}`;
    expect(didDocument.id).toBe(did);
    const decodedPayload = decodeJson(createPayload1.payload);
    expect(didDocument['@context']).toBe(decodedPayload['@context']);
    expect(didDocument.publicKey).toEqual(decodedPayload.publicKey);
  });

  it('should resolve the second did when the observer synced the transaction', async () => {
    const didDocument = await resolve(sidetree)(didUniqueSuffix2);
    const did = `did:elem:${didUniqueSuffix2}`;
    expect(didDocument.id).toBe(did);
    const decodedPayload = decodeJson(createPayload2.payload);
    expect(didDocument['@context']).toBe(decodedPayload['@context']);
    expect(didDocument.publicKey).toEqual(decodedPayload.publicKey);
  });
});
