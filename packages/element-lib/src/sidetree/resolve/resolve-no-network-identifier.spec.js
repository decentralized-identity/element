const {
  didMethodName,
  didMethodNameWithoutNetworkIdentifier,
  getTestSideTree,
  getLastOperation,
} = require('../../__tests__/test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

const replaceKid = (payload, privateKey) => {
  const header = sidetree.func.decodeJson(payload.protected);
  const oldKid = header.kid;
  const newKid = oldKid.replace(
    didMethodName,
    didMethodNameWithoutNetworkIdentifier
  );
  const newHeader = {
    ...header,
    kid: newKid,
  };
  const decodedPayload = sidetree.func.decodeJson(payload.payload);
  return sidetree.op.makeSignedOperation(newHeader, decodedPayload, privateKey);
};

jest.setTimeout(10 * 1000);

describe('resolve', () => {
  let mks;
  let primaryKey;
  let recoveryKey;
  let didDocumentModel;
  let createPayload;
  let didUniqueSuffix;

  const resetDid = async () => {
    mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    primaryKey = mks.getKeyForPurpose('primary', 0);
    recoveryKey = mks.getKeyForPurpose('recovery', 0);
    didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    createPayload = sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    createPayload = await replaceKid(createPayload, primaryKey.privateKey);
    await sidetree.batchScheduler.writeNow(createPayload);
  };

  describe('create', () => {
    beforeAll(resetDid);

    it('should be resolveable with network identifier', async () => {
      const did = `${didMethodName}:${didUniqueSuffix}`;
      const didDocument = await sidetree.resolve(did, true);
      expect(didDocument.id).toBe(did);
      expect(didDocument.publicKey).toHaveLength(2);
    });

    it('should be resolveable without network identifier', async () => {
      const did = `${didMethodNameWithoutNetworkIdentifier}:${didUniqueSuffix}`;
      const didDocument = await sidetree.resolve(did, true);
      expect(didDocument.id).toBe(`${didMethodName}:${didUniqueSuffix}`);
      expect(didDocument.publicKey).toHaveLength(2);
    });
  });

  describe('update', () => {
    beforeAll(resetDid);

    it('should add a new key', async () => {
      const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
      const newKey = mks.getKeyForPurpose('primary', 1);
      const newPublicKey = {
        id: `${didMethodName}:${didUniqueSuffix}#newKey`,
        usage: 'signing',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: newKey.publicKey,
      };
      let payload = sidetree.op.getUpdatePayloadForAddingAKey(
        lastOperation,
        newPublicKey,
        primaryKey.privateKey
      );
      payload = await replaceKid(payload, primaryKey.privateKey);
      await sidetree.batchScheduler.writeNow(payload);
      const did = `${didMethodName}:${didUniqueSuffix}`;
      const didDocument = await sidetree.resolve(did, true);
      expect(didDocument.publicKey).toHaveLength(3);
      expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
      expect(didDocument.publicKey[2].controller).toBe(didDocument.id);
    });

    it('should be resolveable without network identifier', async () => {
      const did = `${didMethodNameWithoutNetworkIdentifier}:${didUniqueSuffix}`;
      const didDocument = await sidetree.resolve(did, true);
      expect(didDocument.id).toBe(`${didMethodName}:${didUniqueSuffix}`);
      expect(didDocument.publicKey).toHaveLength(3);
    });
  });

  describe('recover', () => {
    let primaryKey2;
    let recoveryKey2;

    beforeAll(resetDid);

    it('should replace the did document with the one provided in the payload', async () => {
      primaryKey2 = mks.getKeyForPurpose('primary', 1);
      recoveryKey2 = mks.getKeyForPurpose('recovery', 1);
      const didDocumentModel2 = sidetree.op.getDidDocumentModel(
        primaryKey2.publicKey,
        recoveryKey2.publicKey
      );
      let payload = sidetree.op.getRecoverPayload(
        didUniqueSuffix,
        didDocumentModel2,
        recoveryKey.privateKey
      );
      payload = await replaceKid(payload, recoveryKey.privateKey);
      await sidetree.batchScheduler.writeNow(payload);
      const didDocument = await sidetree.resolve(didUniqueSuffix, true);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey2.publicKey);
      expect(didDocument.publicKey[1].publicKeyHex).toBe(
        recoveryKey2.publicKey
      );
      expect(didDocument.id).toContain(didUniqueSuffix);
    });

    it('should be resolveable without network identifier', async () => {
      const did = `${didMethodNameWithoutNetworkIdentifier}:${didUniqueSuffix}`;
      const didDocument = await sidetree.resolve(did, true);
      expect(didDocument.id).toBe(`${didMethodName}:${didUniqueSuffix}`);
      expect(didDocument.publicKey).toHaveLength(2);
      expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey2.publicKey);
    });
  });

  describe('delete', () => {
    beforeAll(resetDid);

    it('should delete a did document', async () => {
      let deletePayload = sidetree.op.getDeletePayload(
        didUniqueSuffix,
        recoveryKey.privateKey
      );
      deletePayload = await replaceKid(deletePayload, recoveryKey.privateKey);
      await sidetree.batchScheduler.writeNow(deletePayload);
      const didDocument = await sidetree.resolve(didUniqueSuffix, true);
      expect(didDocument).not.toBeDefined();
    });

    it('should be resolveable without network identifier', async () => {
      const did = `${didMethodNameWithoutNetworkIdentifier}:${didUniqueSuffix}`;
      const didDocument = await sidetree.resolve(did, true);
      expect(didDocument).not.toBeDefined();
    });
  });
});
