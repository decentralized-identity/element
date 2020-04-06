const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
} = require('../../__tests__/test-utils');
const {
  getDidDocumentModel,
  getCreatePayload,
  getUpdatePayloadForAddingAKey,
  getRecoverPayload,
  getDeletePayload,
} = require('../op');
const { getDidUniqueSuffix, decodeJson } = require('../../func');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

jest.setTimeout(10 * 1000);

describe('resolve', () => {
  let mks;
  let primaryKey;
  let recoveryKey;
  let didDocumentModel;
  let createPayload;
  let didUniqueSuffix;

  beforeEach(async () => {
    mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    primaryKey = mks.getKeyForPurpose('primary', 0);
    recoveryKey = mks.getKeyForPurpose('recovery', 0);
    didDocumentModel = getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    createPayload = getCreatePayload(didDocumentModel, primaryKey);
    didUniqueSuffix = getDidUniqueSuffix(createPayload);
    await sidetree.batchScheduler.writeNow(createPayload);
  });

  describe('create', () => {
    it('should be resolveable after sync', async () => {
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

  describe('update', () => {
    it('should add a new key', async () => {
      const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
      const newKey = mks.getKeyForPurpose('primary', 1);
      const newPublicKey = {
        id: `${didMethodName}:${didUniqueSuffix}#newKey`,
        usage: 'signing',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: newKey.publicKey,
      };
      const payload = getUpdatePayloadForAddingAKey(
        lastOperation,
        newPublicKey,
        primaryKey.privateKey
      );
      await sidetree.batchScheduler.writeNow(payload);
      const didDocument = await sidetree.resolve(didUniqueSuffix, true);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
      expect(didDocument.publicKey[2].controller).toBe(didDocument.id);
    });
  });

  describe('recover', () => {
    it('should replace the did document with the one provided in the payload', async () => {
      const primaryKey2 = mks.getKeyForPurpose('primary', 1);
      const recoveryKey2 = mks.getKeyForPurpose('recovery', 1);
      const didDocumentModel2 = getDidDocumentModel(
        primaryKey2.publicKey,
        recoveryKey2.publicKey
      );
      const payload = getRecoverPayload(
        didUniqueSuffix,
        didDocumentModel2,
        recoveryKey.privateKey
      );
      await sidetree.batchScheduler.writeNow(payload);
      const didDocument = await sidetree.resolve(didUniqueSuffix, true);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey2.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(
        recoveryKey2.publicKey
      );
      expect(didDocument.id).toContain(didUniqueSuffix);
    });
  });

  describe('delete', () => {
    it('should delete a did document', async () => {
      const deletePayload = getDeletePayload(
        didUniqueSuffix,
        recoveryKey.privateKey
      );
      await sidetree.batchScheduler.writeNow(deletePayload);
      const didDocument = await sidetree.resolve(didUniqueSuffix, true);
      expect(didDocument).not.toBeDefined();
    });
  });
});
