const { Ed25519KeyPair } = require('crypto-ld');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const X25519KeyPair = require('x25519-key-pair');

const getCompressedPublicFromPrivate = privateKeyHex =>
  secp256k1.publicKeyCreate(Buffer.from(privateKeyHex, 'hex')).toString('hex');

const getUncompressedPublicKeyFromCompressedPublicKey = compressedPublicKeyHex =>
  secp256k1
    .publicKeyConvert(Buffer.from(compressedPublicKeyHex, 'hex'), false)
    .slice(1)
    .toString('hex');

// Might need to expand the public key before converting it to address
const publicKeyToAddress = pubKey => {
  const addr = ethUtil
    .publicToAddress(Buffer.from(pubKey, 'hex'))
    .toString('hex');
  const address = ethUtil.toChecksumAddress(addr);
  return address;
};

const mnemonicToKeypair = (mnemonic, hdPath) => {
  const seed = bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const addrNode = root.derive(hdPath);
  // eslint-disable-next-line
  const privateKeyHex = addrNode._privateKey.toString('hex');
  return {
    // this should be compressed.
    publicKey: getCompressedPublicFromPrivate(privateKeyHex),
    privateKey: privateKeyHex,
  };
};

const createKeys = () => {
  // generate privKey
  let privKey;
  do {
    privKey = crypto.randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privKey));
  const pubKey = secp256k1.publicKeyCreate(privKey);
  return {
    publicKey: pubKey.toString('hex'),
    privateKey: privKey.toString('hex'),
  };
};

const createEd25519Keys = async () => {
  const key = await Ed25519KeyPair.generate();
  return key;
};

module.exports = {
  bip39,
  hdkey,
  ethereum: {
    publicKeyToAddress,
    mnemonicToKeypair,
  },
  secp256k1: {
    getCompressedPublicFromPrivate,
    getUncompressedPublicKeyFromCompressedPublicKey,
    createKeys,
  },
  ed25519: {
    createKeys: createEd25519Keys,
    X25519KeyPair,
  },
};
