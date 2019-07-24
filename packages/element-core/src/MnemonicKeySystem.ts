import * as bip39 from 'bip39';
import hdkey from 'hdkey';
import secp256k1 from 'secp256k1';

/**
 * Clients that need keys should use bip44 path targets at a sidetree
 * implementation, such as ION or Element.
 *
 * Clients should not use a bip44 path that might be used in any existing
 * wallet system, such as Trezor, Ledger or MetaMask for Bitoin or Ethereum.
 *
 * ```typescript
 * const COIN_TYPE = 60; // ETH
 * const ACCOUNT = 0;
 * ```
 * See [bip44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) for more details.
 */

const COIN_TYPE = 19951028; // Bill Gates Birthday / placeholder.
const ACCOUNT = 0;

const getHDPathForProofPurpose = (purpose: string, version: number): string => {
  switch (purpose) {
    case 'recovery':
      return `m/44'/${COIN_TYPE}'/${ACCOUNT}'/0/1${version}`;
    case 'primary':
      return `m/44'/${COIN_TYPE}'/${ACCOUNT}'/0/2${version}`;
    case 'attestation':
      return `m/44'/${COIN_TYPE}'/${ACCOUNT}'/0/3${version}`;
    default:
      throw new Error(`Unknown proof purpose: ${purpose}`);
  }
};

/**
 * Example
 * ```json
 * {
 *   "publicKey": "03b32ea4196e9fb1bf312abcf2ef0c41331f08873e651a361e7fda49bb7302d891",
 *   "privateKey": "adc9fe03f9082431dfc34556ff132fcad4151dece6e0fa1240112ef823e0c1c6"
 * }
 * ```
 * See [secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node#usage) for more details.
 */

export interface ICompressedHexEncodedSecp256k1Keypair {
  /** Hex encoded compressed secp256k1 public key */
  publicKey: string;
  /** Hex encoded secp256k1 private key */
  privateKey: string;
}

/**
 * Be carefult to await the seed!
 * ```typescript
 * const mnemonic = MnemonicKeySystem.generateMnemonic()
 * const seed = await MnemonicKeySystem.mnemonicToSeed(mnemonic)
 * const instance = new MnemonicKeySystem(seed);
 * ```
 */

export class MnemonicKeySystem {
  /** See https://github.com/bitcoinjs/bip39#examples */
  public static generateMnemonic(): string {
    return bip39.generateMnemonic();
  }

  /** See https://github.com/bitcoinjs/bip39#examples */
  public static async mnemonicToSeed(mnemonic: string): Promise<Buffer> {
    return bip39.mnemonicToSeed(mnemonic);
  }

  private root: hdkey;

  constructor(seed: Buffer) {
    this.root = hdkey.fromMasterSeed(seed);
  }

  /**
   * Use the wallet hd path to get a keypair for a purpose by a version number
   * ```typescript
   * const mnemonic = MnemonicKeySystem.generateMnemonic();
   * const seed = await MnemonicKeySystem.mnemonicToSeed(mnemonic);
   * const mks = new MnemonicKeySystem(seed);
   * const recoveryKey0 = mks.getKeyForPurpose('recovery', 0);
   * const primaryKey0 = mks.getKeyForPurpose('primary', 0);
   * ```
   */

  public getKeyForPurpose(purpose: string, version: number) {
    return this.getKeyFromHDPath(getHDPathForProofPurpose(purpose, version));
  }

  private getKeyFromHDPath(
    hdPath: string
  ): ICompressedHexEncodedSecp256k1Keypair {
    const addrNode = this.root.derive(hdPath);
    const privateKeyHex = addrNode.privateKey.toString('hex');

    return {
      privateKey: privateKeyHex,
      publicKey: secp256k1
        .publicKeyCreate(Buffer.from(privateKeyHex, 'hex'))
        .toString('hex'),
    };
  }
}
