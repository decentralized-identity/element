import { ElementDIDManager } from './ElementDIDManager';

import {
  ENCRYPTED_WALLET,
  MNEMONIC,
  PASSWORD,
  PRIVATE_KEY,
  PUBLIC_KEY,
} from './__fixtures__';

describe(`ElementDIDManager`, () => {
  describe(`createInstance`, () => {
    it('can create a new manager, with a wallet protected by a password', () => {
      const manager = ElementDIDManager.createInstance(PASSWORD);
      expect(manager.wallet).toBeDefined();
    });
  });

  describe(`constructor`, () => {
    it('can create a new manager from an encrypted wallet', () => {
      const manager = new ElementDIDManager(ENCRYPTED_WALLET);
      expect(manager.wallet).toBeDefined();
    });
  });

  describe(`getDIDKeyForPurpose`, () => {
    it('can get a key for a purpose from a mnemonic in a wallet', async () => {
      const manager = new ElementDIDManager(ENCRYPTED_WALLET);
      manager.wallet.unlock(PASSWORD);
      const key = await manager.getDIDKeyForPurpose(
        'did:example:456',
        'primary',
        0
      );
      expect(key.publicKey).toBeDefined();
      expect(key.privateKey).toBeDefined();
    });
  });
});
