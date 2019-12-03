const create = require('./create');
const resolve = require('./resolve');
const { getTestSideTree } = require('../test-utils');
const {
  getDidDocumentModel,
  getCreatePayload,
  getUpdatePayloadForAddingAKey,
  getUpdatePayloadForRemovingAKey,
  getRecoverPayload,
  getDeletePayload,
} = require('../op');
const { getDidUniqueSuffix, syncTransaction, decodeJson } = require('../func');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();


describe('resolve', () => {
  describe('create', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    let createPayload;
    let createTransaction;
    let didUniqueSuffix;
    let primaryKey;
    let recoveryKey;

    beforeAll(async () => {
      primaryKey = await mks.getKeyForPurpose('primary', 0);
      recoveryKey = await mks.getKeyForPurpose('recovery', 0);
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

  describe('update', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    let primaryKey;
    let recoveryKey;
    let didUniqueSuffix;
    let lastOperation;

    beforeAll(async () => {
      primaryKey = await mks.getKeyForPurpose('primary', 0);
      recoveryKey = await mks.getKeyForPurpose('recovery', 0);
      const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
      const createPayload = await getCreatePayload(didDocumentModel, primaryKey);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
      const createTransaction = await create(sidetree)(createPayload);
      await syncTransaction(sidetree, createTransaction);
      const operations = await sidetree.db.readCollection(didUniqueSuffix);
      lastOperation = operations.pop();
    });

    it('should add a new key', async () => {
      const newKey = await mks.getKeyForPurpose('primary', 1);
      const payload = await getUpdatePayloadForAddingAKey(lastOperation, '#newKey', newKey.publicKey, primaryKey.privateKey);
      const transaction = await create(sidetree)(payload);
      await syncTransaction(sidetree, transaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    });

    it('should remove a key', async () => {
      const payload = await getUpdatePayloadForRemovingAKey(lastOperation, '#newKey', primaryKey.privateKey);
      const transaction = await create(sidetree)(payload);
      await syncTransaction(sidetree, transaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(2);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    });
  });

  describe('recover', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    let primaryKey;
    let recoveryKey;
    let primaryKey2;
    let recoveryKey2;
    let didUniqueSuffix;
    let didDocumentModel2;

    beforeAll(async () => {
      primaryKey = await mks.getKeyForPurpose('primary', 0);
      recoveryKey = await mks.getKeyForPurpose('recovery', 0);
      const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
      const createPayload = await getCreatePayload(didDocumentModel, primaryKey);
      const createTransaction = await create(sidetree)(createPayload);
      await syncTransaction(sidetree, createTransaction);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
      primaryKey2 = await mks.getKeyForPurpose('primary', 1);
      recoveryKey2 = await mks.getKeyForPurpose('recovery', 1);
      didDocumentModel2 = getDidDocumentModel(primaryKey2.publicKey, recoveryKey2.publicKey);
    });

    it('should not work if specified kid does not exist in did document', async () => {
      const invalidPayload = await getRecoverPayload(didUniqueSuffix, didDocumentModel2, recoveryKey.privateKey, '#recoveryy');
      const invalidTransaction = await create(sidetree)(invalidPayload);
      await syncTransaction(sidetree, invalidTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    });

    it('should not work if signature is not of the recovery key', async () => {
      const invalidPayload = await getRecoverPayload(didUniqueSuffix, didDocumentModel2, primaryKey.privateKey, '#recovery');
      const invalidTransaction = await create(sidetree)(invalidPayload);
      await syncTransaction(sidetree, invalidTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    });

    it('should not work if there is no corresponding create operation', async () => {
      const fakeDidUniqueSuffix = 'fakediduniquesuffix';
      const invalidPayload = await getRecoverPayload(fakeDidUniqueSuffix, didDocumentModel2, recoveryKey.privateKey, '#recovery');
      const invalidTransaction = await create(sidetree)(invalidPayload);
      await syncTransaction(sidetree, invalidTransaction);
      const didDocument = await resolve(sidetree)(fakeDidUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should replace the did document with the one provided in the payload', async () => {
      const payload = await getRecoverPayload(didUniqueSuffix, didDocumentModel2, recoveryKey.privateKey, '#recovery');
      const transaction = await create(sidetree)(payload);
      await syncTransaction(sidetree, transaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey2.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey2.publicKey);
      expect(didDocument.id).toContain(didUniqueSuffix);
    });
  });

  describe('delete', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    let deletePayload;
    let didUniqueSuffix;
    let primaryKey;
    let recoveryKey;

    beforeAll(async () => {
      primaryKey = await mks.getKeyForPurpose('primary', 0);
      recoveryKey = await mks.getKeyForPurpose('recovery', 0);
      const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
      const createPayload = await getCreatePayload(didDocumentModel, primaryKey);
      const createTransaction = await create(sidetree)(createPayload);
      await syncTransaction(sidetree, createTransaction);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
    });

    it('should not work if specified kid does not exist in did document', async () => {
      const invalidDeletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey, '#recoveryy');
      const invalidDeleteTransaction = await create(sidetree)(invalidDeletePayload);
      await syncTransaction(sidetree, invalidDeleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.id).toBeDefined();
    });

    it('should not work if signature is not of the recovery key', async () => {
      const invalidDeletePayload = await getDeletePayload(didUniqueSuffix, primaryKey.privateKey, '#recovery');
      const invalidDeleteTransaction = await create(sidetree)(invalidDeletePayload);
      await syncTransaction(sidetree, invalidDeleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.id).toBeDefined();
    });

    it('should not work if there is no corresponding create operation', async () => {
      const fakeDidUniqueSuffix = 'fakediduniquesuffix';
      const invalidDeletePayload = await getDeletePayload(fakeDidUniqueSuffix, recoveryKey.privateKey, '#recovery');
      const invalidDeleteTransaction = await create(sidetree)(invalidDeletePayload);
      await syncTransaction(sidetree, invalidDeleteTransaction);
      const didDocument = await resolve(sidetree)(fakeDidUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should delete a did document', async () => {
      deletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey, '#recovery');
      const deleteTransaction = await create(sidetree)(deletePayload);
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
