const element = require('../../../index');

describe('element.crypto', () => {
  describe('mnemonic -> keypair -> compressed and back', () => {
    it('works as expected', async () => {
      // const mnemonic = element.crypto.bip39.generateMnemonic();
      // console.log(mnemonic);
      // eslint-disable-next-line
      // const mnemonic = 'panda lion unfold live venue spice urban member march gift obvious gossip';
      // const hdKeypair = element.blockchain.mnemonicToKeypair(mnemonic, "m/44'/60'/0'/0/0");
      const hdKeypair = {
        publicKey:
          'ccb779691f3599247f9a0ca3c9739ec966ead243aa7e0d312413ce2461d60233c25def15dd8a3608df8f14269e3af4bcf1783567fdaec15dd61c8d77b6ae9c4d',
        privateKey:
          'bfa1480820ff65158467cc9e4e62f6cf46416aebc196e562405f51ed1d86f20b',
      };

      // compress public key
      const compressedPublicKey = element.crypto.secp256k1.getCompressedPublicFromPrivate(
        hdKeypair.privateKey
      );

      // decompress from compress public key...
      const maybeCorrect = element.crypto.secp256k1.getUncompressedPublicKeyFromCompressedPublicKey(
        compressedPublicKey
      );

      expect(maybeCorrect).toBe(hdKeypair.publicKey);
    });
  });
});
