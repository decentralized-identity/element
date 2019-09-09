const element = require('./index.js');

const mnemonic = element.crypto.bip39.generateMnemonic();
console.log({ mnemonic });

const keypair = element.crypto.ethereum.mnemonicToKeypair(mnemonic, "m/44'/60'/0'/0/0");
const publicKey = element.crypto.secp256k1.getUncompressedPublicKeyFromCompressedPublicKey(
  keypair.publicKey,
);
const address = element.crypto.ethereum.publicKeyToAddress(publicKey, "m/44'/60'/0'/0/0");
console.log({ address });
