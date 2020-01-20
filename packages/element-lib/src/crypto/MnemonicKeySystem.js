const secp256k1 = require('secp256k1');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');

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

// FIXME: purposeIndex
const getPathForProofPurpose = (purpose, version) => {
  let purposeIndex = 0;
  switch (purpose) {
    case 'primary':
      purposeIndex = 1;
      break;
    case 'attestation':
      purposeIndex = 2;
      break;
    default:
    case 'root':
    case 'recovery':
      purposeIndex = 0;
      break;
  }
  return `m/44'/60'/0'/${purposeIndex}/${version}`;
};

class MnemonicKeySystem {
  static generateMnemonic() {
    return bip39.generateMnemonic();
  }

  constructor(mnemonic) {
    const seed = bip39.mnemonicToSeed(mnemonic);
    this.root = hdkey.fromMasterSeed(seed);
    // eslint-disable-next-line
    this.getUncompressedPublicKeyFromCompressedPublicKey = getUncompressedPublicKeyFromCompressedPublicKey;
    this.publicKeyToAddress = publicKeyToAddress;
  }

  getKeyFromHDPath(hdPath) {
    const addrNode = this.root.derive(hdPath);
    // eslint-disable-next-line
    const privateKeyHex = addrNode._privateKey.toString('hex');
    return {
      // this should be compressed.
      publicKey: getCompressedPublicFromPrivate(privateKeyHex),
      privateKey: privateKeyHex,
    };
  }

  getKeyForPurpose(purpose, version) {
    return this.getKeyFromHDPath(getPathForProofPurpose(purpose, version));
  }
}

module.exports = MnemonicKeySystem;
