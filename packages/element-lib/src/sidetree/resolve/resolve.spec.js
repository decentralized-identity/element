/* eslint-disable max-len */
const resolve = require('./');
const {
  getTestSideTree,
  changeKid,
  getDidDocumentForPayload,
  getCreatePayloadForKeyIndex,
} = require('../__tests__/test-utils');
const {
  getDidDocumentModel,
  makeSignedOperation,
  getCreatePayload,
  getUpdatePayloadForAddingAKey,
  getUpdatePayloadForRemovingAKey,
  getRecoverPayload,
  getDeletePayload,
} = require('../op');
const {
  getDidUniqueSuffix,
  syncTransaction,
  decodeJson,
} = require('../func');
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
    let didDocumentModel;

    beforeAll(async () => {
      primaryKey = await mks.getKeyForPurpose('primary', 0);
      recoveryKey = await mks.getKeyForPurpose('recovery', 0);
      didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
      createPayload = await getCreatePayload(didDocumentModel, primaryKey);
      createTransaction = await sidetree.batchScheduler.writeNow(createPayload);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
    });

    it('should not work if specified kid does not exist in did document', async () => {
      const invalidCreatePayload = changeKid(createPayload, '#invalidKid');
      const didDocument = await getDidDocumentForPayload(sidetree, invalidCreatePayload, didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should not work if signature is not valid', async () => {
      const invalidCreatePayload = await getCreatePayload(didDocumentModel, recoveryKey);
      const didDocument = await getDidDocumentForPayload(sidetree, invalidCreatePayload, didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should not work if payload is not a valid did document model', async () => {
      const invalidDidDocumentModel = {
        ...didDocumentModel,
        '@context': undefined,
      };
      const header = decodeJson(createPayload.protected);
      const invalidCreatePayload = makeSignedOperation(header, invalidDidDocumentModel, primaryKey.privateKey);
      const didDocument = await getDidDocumentForPayload(sidetree, invalidCreatePayload, didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
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
      expect(operations.length >= 1).toBeTruthy();
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
    let createPayload;

    const getLastOperation = async () => {
      const operations = await sidetree.db.readCollection(didUniqueSuffix);
      operations.sort((o1, o2) => o1.transaction.transactionTime - o2.transaction.transactionTime);
      const last = operations.pop();
      return last;
    };

    beforeAll(async () => {
      primaryKey = await mks.getKeyForPurpose('primary', 0);
      recoveryKey = await mks.getKeyForPurpose('recovery', 0);
      const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
      createPayload = await getCreatePayload(didDocumentModel, primaryKey);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
      const createTransaction = await sidetree.batchScheduler.writeNow(createPayload);
      await syncTransaction(sidetree, createTransaction);
      lastOperation = await getLastOperation();
    });

    it('should not work if specified kid does not exist in did document', async () => {
      const newKey = await mks.getKeyForPurpose('primary', 1);
      const updatePayload = await getUpdatePayloadForAddingAKey(lastOperation, '#newKey', 'signing', newKey.publicKey, primaryKey.privateKey);
      const invalidUpdatePayload = changeKid(updatePayload);
      const didDocument = await getDidDocumentForPayload(sidetree, invalidUpdatePayload, didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(2);
    });

    it('should not work if signature is not valid', async () => {
      const newKey = await mks.getKeyForPurpose('primary', 1);
      const invalidUpdatePayload = await getUpdatePayloadForAddingAKey(lastOperation, '#newKey', 'signing', newKey.publicKey, recoveryKey.privateKey);
      const didDocument = await getDidDocumentForPayload(sidetree, invalidUpdatePayload, didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(2);
    });

    it('should add a new key', async () => {
      const newKey = await mks.getKeyForPurpose('primary', 1);
      const payload = await getUpdatePayloadForAddingAKey(lastOperation, '#newKey', 'signing', newKey.publicKey, primaryKey.privateKey);
      const transaction = await sidetree.batchScheduler.writeNow(payload);
      await syncTransaction(sidetree, transaction);
      lastOperation = await getLastOperation();
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    });

    it('should remove a key', async () => {
      const payload = await getUpdatePayloadForRemovingAKey(lastOperation, '#newKey', primaryKey.privateKey);
      const transaction = await sidetree.batchScheduler.writeNow(payload);
      await syncTransaction(sidetree, transaction);
      lastOperation = await getLastOperation();
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(2);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    });

    it('should support multiple patches', async () => {
      const newKey2 = await mks.getKeyForPurpose('primary', 2);
      const newKey3 = await mks.getKeyForPurpose('primary', 3);
      const payload = {
        didUniqueSuffix: lastOperation.didUniqueSuffix,
        previousOperationHash: lastOperation.operation.operationHash,
        patches: [
          {
            action: 'add-public-keys',
            publicKeys: [
              {
                id: '#newKey2',
                usage: 'signing',
                type: 'Secp256k1VerificationKey2018',
                publicKeyHex: newKey2.publicKey,
              },
              {
                id: '#newKey3',
                usage: 'signing',
                type: 'Secp256k1VerificationKey2018',
                publicKeyHex: newKey3.publicKey,
              },
            ],
          }, {
            action: 'remove-public-keys',
            publicKeys: ['#primary'],
          },
        ],
      };
      const header = {
        operation: 'update',
        kid: '#primary',
        alg: 'ES256K',
      };
      const operation = makeSignedOperation(header, payload, primaryKey.privateKey);
      const transaction = await sidetree.batchScheduler.writeNow(operation);
      await syncTransaction(sidetree, transaction);
      lastOperation = await getLastOperation();
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(recoveryKey.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(newKey2.publicKey);
      expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey3.publicKey);
    });

    it('should not process a patch removing the recovery key', async () => {
      const payload = await getUpdatePayloadForRemovingAKey(lastOperation, '#recovery', primaryKey.privateKey);
      const transaction = await sidetree.batchScheduler.writeNow(payload);
      await syncTransaction(sidetree, transaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(recoveryKey.publicKey);
    });

    it('should do nothing if removing a key that does not exist', async () => {
      const payload = await getUpdatePayloadForRemovingAKey(lastOperation, '#fakekid', primaryKey.privateKey);
      const transaction = await sidetree.batchScheduler.writeNow(payload);
      await syncTransaction(sidetree, transaction);
      lastOperation = await getLastOperation();
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(recoveryKey.publicKey);
    });

    it('should not process another create operation after update', async () => {
      const createTransaction = await sidetree.batchScheduler.writeNow(createPayload);
      await syncTransaction(sidetree, createTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(recoveryKey.publicKey);
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
      const createTransaction = await sidetree.batchScheduler.writeNow(createPayload);
      await syncTransaction(sidetree, createTransaction);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
      primaryKey2 = await mks.getKeyForPurpose('primary', 1);
      recoveryKey2 = await mks.getKeyForPurpose('recovery', 1);
      didDocumentModel2 = getDidDocumentModel(primaryKey2.publicKey, recoveryKey2.publicKey);
    });

    it('should not work if specified kid does not exist in did document', async () => {
      const recoverPayload = await getRecoverPayload(didUniqueSuffix, didDocumentModel2, recoveryKey.privateKey);
      const invalidRecoverPayload = changeKid(recoverPayload, '#invalidKid');
      const didDocument = await getDidDocumentForPayload(sidetree, invalidRecoverPayload, didUniqueSuffix);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    });

    it('should not work if signature is not valid', async () => {
      const invalidRecoverPayload = await getRecoverPayload(didUniqueSuffix, didDocumentModel2, primaryKey.privateKey);
      const didDocument = await getDidDocumentForPayload(sidetree, invalidRecoverPayload, didUniqueSuffix);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    });

    it('should not work if payload is not a valid did document model', async () => {
      const invalidDidDocumentModel = {
        ...didDocumentModel2,
        '@context': undefined,
      };
      const payload = {
        didUniqueSuffix,
        newDidDocument: invalidDidDocumentModel,
      };
      const header = {
        operation: 'recover',
        kid: '#recovery',
        alg: 'ES256K',
      };
      const invalidRecoverPayload = makeSignedOperation(header, payload, recoveryKey.privateKey);
      const didDocument = await getDidDocumentForPayload(sidetree, invalidRecoverPayload, didUniqueSuffix);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    });

    it('should not work if there is no corresponding create operation', async () => {
      const fakeDidUniqueSuffix = 'fakediduniquesuffix';
      const invalidPayload = await getRecoverPayload(fakeDidUniqueSuffix, didDocumentModel2, recoveryKey.privateKey);
      const invalidTransaction = await sidetree.batchScheduler.writeNow(invalidPayload);
      await syncTransaction(sidetree, invalidTransaction);
      const didDocument = await resolve(sidetree)(fakeDidUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should replace the did document with the one provided in the payload', async () => {
      const payload = await getRecoverPayload(didUniqueSuffix, didDocumentModel2, recoveryKey.privateKey);
      const transaction = await sidetree.batchScheduler.writeNow(payload);
      await syncTransaction(sidetree, transaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey2.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey2.publicKey);
      expect(didDocument.id).toContain(didUniqueSuffix);
    });
  });

  describe('delete', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    let didUniqueSuffix;
    let primaryKey;
    let recoveryKey;

    beforeAll(async () => {
      primaryKey = await mks.getKeyForPurpose('primary', 0);
      recoveryKey = await mks.getKeyForPurpose('recovery', 0);
      const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
      const createPayload = await getCreatePayload(didDocumentModel, primaryKey);
      const createTransaction = await sidetree.batchScheduler.writeNow(createPayload);
      await syncTransaction(sidetree, createTransaction);
      didUniqueSuffix = getDidUniqueSuffix(createPayload);
    });

    it('should not work if specified kid does not exist in did document', async () => {
      const deletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey);
      const invalidDeletePayload = changeKid(deletePayload, '#invalidKid');
      const didDocument = await getDidDocumentForPayload(sidetree, invalidDeletePayload, didUniqueSuffix);
      expect(didDocument.id).toBeDefined();
    });

    it('should not work if signature is not valid', async () => {
      const invalidDeletePayload = await getDeletePayload(didUniqueSuffix, primaryKey.privateKey);
      const didDocument = await getDidDocumentForPayload(sidetree, invalidDeletePayload, didUniqueSuffix);
      expect(didDocument.id).toBeDefined();
    });

    it('should not work if there is no corresponding create operation', async () => {
      const fakeDidUniqueSuffix = 'fakediduniquesuffix';
      const invalidDeletePayload = await getDeletePayload(fakeDidUniqueSuffix, recoveryKey.privateKey);
      const invalidDeleteTransaction = await sidetree.batchScheduler.writeNow(invalidDeletePayload);
      await syncTransaction(sidetree, invalidDeleteTransaction);
      const didDocument = await resolve(sidetree)(fakeDidUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should delete a did document', async () => {
      const deletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey);
      const deleteTransaction = await sidetree.batchScheduler.writeNow(deletePayload);
      await syncTransaction(sidetree, deleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });

    it('should return null if two delete operations are sent for the same did', async () => {
      const secondDeletePayload = await getDeletePayload(didUniqueSuffix, recoveryKey.privateKey);
      const secondDeleteTransaction = await sidetree.batchScheduler.writeNow(secondDeletePayload);
      await syncTransaction(sidetree, secondDeleteTransaction);
      const didDocument = await resolve(sidetree)(didUniqueSuffix);
      expect(didDocument).not.toBeDefined();
    });
  });
});

describe('resolve just in time', () => {
  describe('create', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    let createPayload1;
    let createPayload2;
    let createPayload3;
    let didUniqueSuffix1;
    let didUniqueSuffix2;
    let didUniqueSuffix3;

    beforeAll(async () => {
      await sidetree.db.deleteDB();
      // Create a first transaction with two operations
      createPayload1 = await getCreatePayloadForKeyIndex(mks, 0);
      createPayload2 = await getCreatePayloadForKeyIndex(mks, 1);
      didUniqueSuffix1 = getDidUniqueSuffix(createPayload1);
      didUniqueSuffix2 = getDidUniqueSuffix(createPayload2);
      await sidetree.operationQueue.enqueue(didUniqueSuffix1, createPayload1);
      await sidetree.operationQueue.enqueue(didUniqueSuffix2, createPayload2);
      await sidetree.batchWrite();
      // Create a second transaction with one other operation
      createPayload3 = await getCreatePayloadForKeyIndex(mks, 2);
      didUniqueSuffix3 = getDidUniqueSuffix(createPayload3);
      await sidetree.operationQueue.enqueue(didUniqueSuffix3, createPayload3);
      await sidetree.batchWrite();
    });

    it('should resolve the did just in time without syncing first', async () => {
      const didDocument = await resolve(sidetree)(didUniqueSuffix1, true);
      expect(didDocument.id).toContain(didUniqueSuffix1);
    });

    it('should only have synced one of the three operations', async () => {
      const operations1 = await sidetree.db.readCollection(didUniqueSuffix1);
      expect(operations1).toHaveLength(1);
      const operations2 = await sidetree.db.readCollection(didUniqueSuffix2);
      expect(operations2).toHaveLength(0);
      const operations3 = await sidetree.db.readCollection(didUniqueSuffix3);
      expect(operations3).toHaveLength(0);
    });

    it('should not have fully synced any transactions', async () => {
      const cachedTransactions = await sidetree.db.readCollection('transaction');
      expect(cachedTransactions).toHaveLength(0);
    });

    it('should fully synced transaction if did is the only suffix in the batch', async () => {
      const didDocument = await resolve(sidetree)(didUniqueSuffix3, true);
      expect(didDocument.id).toContain(didUniqueSuffix3);
      const cachedTransactions = await sidetree.db.readCollection('transaction');
      expect(cachedTransactions).toHaveLength(1);
    });
  });
});
