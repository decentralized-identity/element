const create = require('./create');
const { getTestSideTree, getCreatePayload } = require('../test-utils');
const { batchFileToOperations, getDidUniqueSuffix } = require('../func');

const sidetree = getTestSideTree();

describe('create', () => {
  let createPayload;
  let transaction;
  let anchorFile;
  let batchFile;

  beforeAll(async () => {
    createPayload = await getCreatePayload();
  });

  it('should anchor an anchorFileHash to Ethereum', async () => {
    transaction = await create(sidetree)(createPayload);
    expect(transaction.anchorFileHash).toBeDefined();
  });

  it('should publish anchorFile to IPFS', async () => {
    anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    expect(anchorFile.batchFileHash).toBeDefined();
    const didUniqueSuffix = getDidUniqueSuffix(createPayload);
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
});
