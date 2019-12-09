const { getDidDocumentModel } = require('./op');
const { isKeyValid } = require('./validation');
const { MnemonicKeySystem } = require('../../index');

describe('getDidDocumentModel', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
  let primaryKey;
  let recoveryKey;

  beforeAll(async () => {
    primaryKey = await mks.getKeyForPurpose('primary', 0);
    recoveryKey = await mks.getKeyForPurpose('recovery', 0);
  });

  it('should return a valid did document', async () => {
    const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
    expect(didDocumentModel).toBeDefined();
    expect(didDocumentModel['@context']).toBe('https://w3id.org/did/v1');
    expect(didDocumentModel.publicKey).toHaveLength(2);
    expect(isKeyValid(didDocumentModel.publicKey[0])).toBeTruthy();
    expect(isKeyValid(didDocumentModel.publicKey[1])).toBeTruthy();
  });
});
