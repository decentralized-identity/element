const secp256k1 = require('secp256k1');
// const element = require('../../index');

// sidetree signature scheme uses compressed keys...
describe('keys', () => {
  it('converts', async () => {
    // const mnemonic = element.ledger.generateBIP39Mnemonic();
    // const mnemonic = 'panda lion unfold live venue spice urban member march gift obvious gossip';
    // const hdKeypair = element.ledger.mnemonicToKeypair(mnemonic, "m/44'/60'/0'/0/0");
    const hdKeypair = {
      publicKey:
        'ccb779691f3599247f9a0ca3c9739ec966ead243aa7e0d312413ce2461d60233c25def15dd8a3608df8f14269e3af4bcf1783567fdaec15dd61c8d77b6ae9c4d',
      privateKey: 'bfa1480820ff65158467cc9e4e62f6cf46416aebc196e562405f51ed1d86f20b',
    };

    // compress public key
    const compressedKeypairFromHd = {
      ...hdKeypair,
      publicKey: secp256k1
        .publicKeyCreate(Buffer.from(hdKeypair.privateKey, 'hex'))
        .toString('hex'),
    };

    // decompress from compress public key...
    const maybeCorrect = secp256k1
      .publicKeyConvert(Buffer.from(compressedKeypairFromHd.publicKey, 'hex'), false)
      .slice(1)
      .toString('hex');

    expect(maybeCorrect).toBe(hdKeypair.publicKey);
  });
});
