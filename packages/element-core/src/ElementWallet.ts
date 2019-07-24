import * as didWallet from '@transmute/did-wallet';

/**
 * A wrapper around DID Wallet.
 * See [did-wallet](https://github.com/transmute-industries/did-wallet) for more details.
 */
export class ElementWallet {
  private wallet: any;
  constructor(walletData?: string | object) {
    this.wallet = didWallet.create(walletData);
  }

  /**
   * Relists on JSON Schema for validation.
   * See [did-wallet](https://github.com/transmute-industries/did-wallet/tree/master/src/schema) for more details.
   */
  public addKey(didWalletKey: object) {
    this.wallet.addKey(didWalletKey);
  }

  /**
   * Be sure to use a long random password, it is used as your AES256 key!
   * See [did-wallet](  https://github.com/transmute-industries/did-wallet/blob/master/src/DIDWallet.js#L43) for more details.
   */

  public lock(password: string) {
    this.wallet.lock(password);
  }

  /**
   * Be sure to use a long random password, it is used as your AES256 key!
   * See [did-wallet](  https://github.com/transmute-industries/did-wallet/blob/master/src/DIDWallet.js#L43) for more details.
   */

  public unlock(password: string) {
    this.wallet.unlock(password);
  }

  /**
   * Be careful to only extract keys you need
   * See [did-wallet](  https://github.com/transmute-industries/did-wallet) for more details.
   */

  public extractByTags(tags: string[]) {
    return this.wallet.extractByTags(tags);
  }

  /**
   * Be careful exporting an encrypted wallet, the password you chose
   * this the only thing protecting your keys!
   * See [did-wallet](  https://github.com/transmute-industries/did-wallet) for more details.
   */

  public export() {
    return this.wallet.export();
  }
}
