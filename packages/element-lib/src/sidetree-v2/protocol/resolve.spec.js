const create = require('./create');
const resolve = require('./resolve');
const {
  getTestSideTree,
  getCreatePayload,
  getDeletePayload,
} = require('../test-utils');
const { getDidUniqueSuffix, syncTransaction, decodeJson } = require('../func');
const element = require('../../../index');

const sidetree = getTestSideTree();

const mnemonic = element.MnemonicKeySystem.generateMnemonic();
const mks = new element.MnemonicKeySystem(mnemonic);

describe('resolve', () => {
  let createPayload;
  let createTransaction;
  let didUniqueSuffix;
  let deletePayload;
  let deleteTransaction;
  let primaryKey;
  let recoveryKey;

  beforeAll(async () => {
    primaryKey = await mks.getKeyForPurpose('primary', 0);
    recoveryKey = await mks.getKeyForPurpose('recovery', 0);
  });

  describe('after create', () => {
    beforeAll(async () => {
      createPayload = await getCreatePayload(primaryKey, recoveryKey);
      createTransaction = await create(sidetree)(createPayload);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
    });

    it('cache should be empty', async () => {
      const operations = await sidetree.db.readCollection(didUniqueSuffix);
      expect(operations).toHaveLength(0);
    });

    it('should not be resolveable before sync', async () => {
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should be resolveable after sync', async () => {
      await syncTransaction(sidetree, createTransaction);
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

  describe('after delete', () => {
    it('should not delete if specified kid does not exist in did document', async () => {
      const invalidDeletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey, '#recoveryy');
      const invalidDeleteTransaction = await create(sidetree)(invalidDeletePayload);
      await syncTransaction(sidetree, invalidDeleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.id).toBeDefined();
    });

    it('should not delete if signature is not of the recovery key', async () => {
      const invalidDeletePayload = await getDeletePayload(didUniqueSuffix, primaryKey.privateKey, '#recovery');
      const invalidDeleteTransaction = await create(sidetree)(invalidDeletePayload);
      await syncTransaction(sidetree, invalidDeleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.id).toBeDefined();
    });

    it('should return null if there is no corresponding create operation', async () => {
      const fakeDidUniqueSuffix = 'fakediduniquesuffix';
      const invalidDeletePayload = await getDeletePayload(fakeDidUniqueSuffix, recoveryKey.privateKey, '#recovery');
      const invalidDeleteTransaction = await create(sidetree)(invalidDeletePayload);
      await syncTransaction(sidetree, invalidDeleteTransaction);
      const didDocument = await resolve(sidetree)(fakeDidUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should delete a did document', async () => {
      deletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey, '#recovery');
      deleteTransaction = await create(sidetree)(deletePayload);
      await syncTransaction(sidetree, deleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should be the same didUniqueSuffix', async () => {
      const newDidUniqueSuffix = getDidUniqueSuffix(deletePayload);
      expect(newDidUniqueSuffix).toBe(didUniqueSuffix);
    });

    it('should return null if two delete operations are sent for the same did', async () => {
      const secondDeletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey, '#recovery');
      const secondDeleteTransaction = await create(sidetree)(secondDeletePayload);
      await syncTransaction(sidetree, secondDeleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });
  });
});
