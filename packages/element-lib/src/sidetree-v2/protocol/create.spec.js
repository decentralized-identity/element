const create = require('./create');
const resolve = require('./resolve');
const { getTestSideTree, getCreatePayload } = require('../test-utils');
const {
  batchFileToOperations,
  getDidUniqueSuffix,
  decodeJson,
  syncTransaction,
} = require('../func');

const sidetree = getTestSideTree();

// TODO: Add support for writing multiple operations in the same transaction
describe('create', () => {
  let createPayload;
  let transaction;
  let anchorFile;
  let didUniqueSuffix;
  let batchFile;

  beforeAll(async () => {
    createPayload = await getCreatePayload();
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
    expect(didDocument).toEqual(null);
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
