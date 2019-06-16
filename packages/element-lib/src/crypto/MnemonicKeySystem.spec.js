const MnemonicKeySystem = require('./MnemonicKeySystem');

describe('MnemonicKeySystem', () => {
  it('generateMnemonic()', async () => {
    const mnemonic = MnemonicKeySystem.generateMnemonic();
    // console.log(mnemonic);
    expect(mnemonic).toBeDefined();
  });

  it('works as expected', async () => {
    // eslint-disable-next-line
    const mnemonic = 'panda lion unfold live venue spice urban member march gift obvious gossip';
    const mks = new MnemonicKeySystem(mnemonic);
    const rootKey = mks.getKeyForPurpose('root', 0);
    expect(rootKey.publicKey).toBeDefined();
    const recoveryKey = mks.getKeyForPurpose('recovery', 0);
    expect(recoveryKey.publicKey).toBeDefined();
  });
});
