const { getDidDocumentModel } = require('./');
const { isDidDocumentModelValid } = require('../utils/validation');
const { MnemonicKeySystem } = require('../../../index');

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
    expect(isDidDocumentModelValid(didDocumentModel)).toBeTruthy();
  });
});
