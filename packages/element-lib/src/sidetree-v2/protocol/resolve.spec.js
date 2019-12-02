const create = require('./create');
const resolve = require('./resolve');
const { getTestSideTree, getCreatePayload } = require('../test-utils');
const { getDidUniqueSuffix, syncTransaction, decodeJson } = require('../func');

const sidetree = getTestSideTree();

describe('resolve', () => {
  let createPayload;
  let transaction;
  let didUniqueSuffix;

  beforeAll(async () => {
    createPayload = await getCreatePayload();
    transaction = await create(sidetree)(createPayload);
    didUniqueSuffix = getDidUniqueSuffix(createPayload);
  });

  it('cache should be empty', async () => {
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    expect(operations).toHaveLength(0);
  });

  it('should not be resolveable before sync', async () => {
    const didDocument = await resolve(sidetree)(didUniqueSuffix);
    expect(didDocument).toEqual(null);
  });

  it('should be resolveable after sync', async () => {
    await syncTransaction(sidetree, transaction);
    const didDocument = await resolve(sidetree)(didUniqueSuffix);
    const did = `did:elem:${didUniqueSuffix}`;
    expect(didDocument.id).toBe(did);
    const decodedPayload = decodeJson(createPayload.payload);
    expect(didDocument['@context']).toBe(decodedPayload['@context']);
    expect(didDocument.publicKey).toEqual(decodedPayload.publicKey);
  });

  it('should populate the cache', async () => {
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    expect(operations).toHaveLength(1);
    expect(operations[0].id).toBeDefined();
    expect(operations[0].type).toBeDefined();
    expect(operations[0].didUniqueSuffix).toBeDefined();
    expect(operations[0].transaction).toBeDefined();
    expect(operations[0].operation).toBeDefined();
  });

  it('should be resolveable again', async () => {
    const didDocument = await resolve(sidetree)(didUniqueSuffix);
    const did = `did:elem:${didUniqueSuffix}`;
    expect(didDocument.id).toBe(did);
  });
});
