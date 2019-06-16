const element = require('../../../index');

describe('element.crypto', () => {
  describe('mnemonic.keySystem', () => {
    it('works as expected', async () => {
      // eslint-disable-next-line
      const mnemonic = 'panda lion unfold live venue spice urban member march gift obvious gossip';
      const hdKeypair = element.crypto.ethereum.mnemonicToKeypair(mnemonic, "m/44'/60'/0'/0/0");

      console.log(hdKeypair);

      // decompress from compress public key...
      const maybeCorrect = element.crypto.secp256k1.getUncompressedPublicKeyFromCompressedPublicKey(
        hdKeypair.publicKey,
      );

      console.log(maybeCorrect)

      // expect(maybeCorrect).toBe(hdKeypair.publicKey);
    });
  });
});
