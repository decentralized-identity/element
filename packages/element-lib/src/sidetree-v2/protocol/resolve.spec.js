const create = require('./create');
const resolve = require('./resolve');
const {
  getTestSideTree,
  getDidDocumentModel,
  getCreatePayload,
  getRecoverPayload,
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
      const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
      createPayload = await getCreatePayload(didDocumentModel, primaryKey);
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

  describe('recover', () => {
    let primaryKey1;
    let recoveryKey1;
    let primaryKey2;
    let recoveryKey2;
    let didUniqueSuffix1;
    let didDocumentModel2;

    beforeAll(async () => {
      const mnemonic1 = element.MnemonicKeySystem.generateMnemonic();
      const mks1 = new element.MnemonicKeySystem(mnemonic1);
      primaryKey1 = await mks1.getKeyForPurpose('primary', 0);
      recoveryKey1 = await mks1.getKeyForPurpose('recovery', 0);
      const didDocumentModel1 = getDidDocumentModel(primaryKey1.publicKey, recoveryKey1.publicKey);
      const createPayload1 = await getCreatePayload(didDocumentModel1, primaryKey1);
      const createTransaction1 = await create(sidetree)(createPayload1);
      await syncTransaction(sidetree, createTransaction1);
      didUniqueSuffix1 = getDidUniqueSuffix(createPayload1);
      const mnemonic2 = element.MnemonicKeySystem.generateMnemonic();
      const mks2 = new element.MnemonicKeySystem(mnemonic2);
      primaryKey2 = await mks2.getKeyForPurpose('primary', 0);
      recoveryKey2 = await mks2.getKeyForPurpose('recovery', 0);
      didDocumentModel2 = getDidDocumentModel(primaryKey2.publicKey, recoveryKey2.publicKey);
    });

    it('should not work if specified kid does not exist in did document', async () => {
      const invalidPayload = await getRecoverPayload(didUniqueSuffix1, didDocumentModel2, recoveryKey1.privateKey, '#recoveryy');
      const invalidTransaction = await create(sidetree)(invalidPayload);
      await syncTransaction(sidetree, invalidTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix1);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey1.publicKey);
    });

    it('should not work if signature is not of the recovery key', async () => {
      const invalidPayload = await getRecoverPayload(didUniqueSuffix1, didDocumentModel2, primaryKey1.privateKey, '#recovery');
      const invalidTransaction = await create(sidetree)(invalidPayload);
      await syncTransaction(sidetree, invalidTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix1);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey1.publicKey);
    });

    it('should not work if there is no corresponding create operation', async () => {
      const fakeDidUniqueSuffix = 'fakediduniquesuffix';
      const invalidPayload = await getRecoverPayload(fakeDidUniqueSuffix, didDocumentModel2, recoveryKey1.privateKey, '#recovery');
      const invalidTransaction = await create(sidetree)(invalidPayload);
      await syncTransaction(sidetree, invalidTransaction);
      const didDocument = await resolve(sidetree)(fakeDidUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should replace the did document with the one provided in the payload', async () => {
      const payload = await getRecoverPayload(didUniqueSuffix1, didDocumentModel2, recoveryKey1.privateKey, '#recovery');
      const transaction = await create(sidetree)(payload);
      await syncTransaction(sidetree, transaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix1);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey2.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey2.publicKey);
      expect(didDocument.id).toContain(didUniqueSuffix1);
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
