import { ElementWallet } from './ElementWallet';
import { MnemonicKeySystem } from './MnemonicKeySystem';

/** Uses the MnemonicKeySystem and ElementWallet to manage keys for a DID. */
export class ElementDIDManager {
  /** Factory for creating a new wallet and manager. */
  public static createInstance(password: string): ElementDIDManager {
    const mnemonic = MnemonicKeySystem.generateMnemonic();
    const wallet = new ElementWallet();
    // TODO: calculate DID here.
    wallet.addKey({
      encoding: 'bip39',
      mnemonic,
      notes: 'Created by ElementDIDManager on ' + new Date().toISOString(),
      tags: ['did:example:456', 'ElementDIDManager'],
      type: 'mnemonic',
    });
    wallet.lock(password);
    const instance = new ElementDIDManager(wallet.export());
    return instance;
  }
  /** ElementWallet used to store all keys needed by this manager */
  public wallet: ElementWallet;

  constructor(walletData?: string | object) {
    this.wallet = new ElementWallet(walletData);
  }

  /**
   * TODO: need to support multiple mnemonics be DID.
   */
  public async getDIDKeyForPurpose(
    did: string,
    purpose: string,
    version: number
  ) {
    const matchingKeys = this.wallet.extractByTags([did]);
    if (matchingKeys.length === 0) {
      throw new Error('No keys found for DID: ' + did);
    }

    // assume we only have 1 mneumonic per wallet.
    // need other information if this is not the case.
    if (matchingKeys.length === 1 && matchingKeys[0].type === 'mnemonic') {
      const seed = await MnemonicKeySystem.mnemonicToSeed(
        matchingKeys[0].mnemonic
      );
      const mks = new MnemonicKeySystem(seed);
      return mks.getKeyForPurpose(purpose, version);
    }

    throw new Error('No mnemonic found in wallet');
  }
}
