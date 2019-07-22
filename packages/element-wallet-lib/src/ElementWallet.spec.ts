import { ElementWallet } from './ElementWallet';

import {
  ENCRYPTED_WALLET,
  MNEMONIC,
  PASSWORD,
  PRIVATE_KEY,
  PUBLIC_KEY,
} from './__fixtures__';

describe(`ElementWallet`, () => {
  describe(`constructor`, () => {
    it(`can create from nothing`, () => {
      const wallet = new ElementWallet();
      expect(wallet).toBeDefined();
    });
    it(`can create from keys`, () => {
      const wallet = new ElementWallet({
        keys: [
          {
            encoding: 'hex',
            notes: '',
            privateKey: PRIVATE_KEY,
            publicKey: PUBLIC_KEY,
            tags: ['Secp256k1VerificationKey2018', 'did:example:456'],
            type: 'assymetric',
          },
        ],
      });
      expect(wallet).toBeDefined();
    });

    it('can create from ciphertext', () => {
      const wallet = new ElementWallet(ENCRYPTED_WALLET);
      expect(wallet).toBeDefined();
    });
  });

  describe(`addKey`, () => {
    it(`can add an assymetric key`, () => {
      const wallet = new ElementWallet();
      expect(wallet).toBeDefined();
      wallet.addKey({
        encoding: 'hex',
        notes: '',
        privateKey: PRIVATE_KEY,
        publicKey: PUBLIC_KEY,
        tags: ['Secp256k1VerificationKey2018', 'did:example:456', 'A'],
        type: 'assymetric',
      });
    });

    it(`can add an mnemonic key`, () => {
      const wallet = new ElementWallet();
      wallet.addKey({
        encoding: 'bip39',
        mnemonic: MNEMONIC,
        notes: '',
        tags: ['did:example:456', 'A'],
        type: 'mnemonic',
      });
      expect(wallet).toBeDefined();
    });
  });

  describe(`lock`, () => {
    it(`can encrypt a wallet with a password`, () => {
      const wallet = new ElementWallet();
      wallet.addKey({
        encoding: 'hex',
        notes: '',
        privateKey: PRIVATE_KEY,
        publicKey: PUBLIC_KEY,
        tags: ['Secp256k1VerificationKey2018', 'did:example:456', 'A'],
        type: 'assymetric',
      });
      wallet.lock(PASSWORD);
      expect(wallet).toBeDefined();
    });
  });

  describe(`unlock`, () => {
    it(`can decrypt a wallet with a password`, () => {
      const wallet = new ElementWallet(ENCRYPTED_WALLET);
      wallet.unlock(PASSWORD);
      expect(wallet).toBeDefined();
    });
  });

  describe(`extractByTags`, () => {
    it(`can decrypt a wallet with a password`, () => {
      const wallet = new ElementWallet();
      // NOTE: keys are indexed by public key
      wallet.addKey({
        encoding: 'hex',
        notes: '',
        privateKey: PRIVATE_KEY,
        publicKey: '...b',
        tags: ['Secp256k1VerificationKey2018', 'did:example:456', 'A'],
        type: 'assymetric',
      });
      wallet.addKey({
        encoding: 'hex',
        notes: '',
        privateKey: PRIVATE_KEY,
        publicKey: '...a',
        tags: ['Secp256k1VerificationKey2018', 'did:example:456', 'B'],
        type: 'assymetric',
      });

      const ALL = wallet.extractByTags(['A', 'B']);
      const A = wallet.extractByTags(['A']);
      const B = wallet.extractByTags(['B']);

      expect(ALL).toHaveLength(2);
      expect(A).toHaveLength(1);
      expect(B).toHaveLength(1);
      expect(ALL).toEqual([...A, ...B]);
    });
  });

  describe(`export`, () => {
    it(`can export a locked walelt`, () => {
      const wallet = new ElementWallet(ENCRYPTED_WALLET);
      const encrypted = wallet.export();
      expect(encrypted).toBeDefined();
    });
  });
});
