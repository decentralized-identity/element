jest.mock('./environment.ts', () => ({
  IS_DEV: true,
  IS_PROD: false,
}));
import hdkey from 'hdkey';
import { MnemonicKeySystem } from './MnemonicKeySystem';

describe(`MnemonicKeySystem`, () => {
  describe(`generateMnemonic`, () => {
    it(`generates a bip39 mnemonic`, () => {
      const spy = jest.spyOn(MnemonicKeySystem, 'generateMnemonic');
      const mnemonic = MnemonicKeySystem.generateMnemonic();
      expect(mnemonic).toBeDefined();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`mnemonicToSeed`, () => {
    it(`converts a mneumonic string to a buffer`, async () => {
      const mnemonic = MnemonicKeySystem.generateMnemonic();
      const spy = jest.spyOn(MnemonicKeySystem, 'mnemonicToSeed');
      const seed = await MnemonicKeySystem.mnemonicToSeed(mnemonic);
      expect(seed).toBeDefined();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`constructor`, () => {
    it(`initializes a wallet from a seed`, async () => {
      let mks: MnemonicKeySystem;
      const mnemonic = MnemonicKeySystem.generateMnemonic();
      const seed = await MnemonicKeySystem.mnemonicToSeed(mnemonic);
      const spy = jest.spyOn(hdkey, 'fromMasterSeed');
      mks = new MnemonicKeySystem(seed);
      expect(mks.getKeyForPurpose).toBeDefined();
      expect(spy).toHaveBeenCalledWith(seed);
    });
  });

  describe(`getKeyForPurpose`, () => {
    let mks: MnemonicKeySystem;
    beforeAll(async () => {
      const mnemonic =
        'forest defy velvet cliff unaware reveal limb forum render major again hard';
      const seed = await MnemonicKeySystem.mnemonicToSeed(mnemonic);
      mks = new MnemonicKeySystem(seed);
    });
    it(`returns a key for a purpose `, async () => {
      const recoveryKey0 = mks.getKeyForPurpose('recovery', 0);
      expect(recoveryKey0.publicKey).toBe(
        '027560af3387d375e3342a6968179ef3c6d04f5d33b2b611cf326d4708badd7770'
      );
      expect(recoveryKey0.privateKey).toBe(
        'ae1605b013c5f6adfeb994e1cbb0777382c317ff309e8cc5500126e4b2c2e19c'
      );

      const primaryKey0 = mks.getKeyForPurpose('primary', 0);
      expect(primaryKey0.publicKey).toBe(
        '030f6b0bf8b40c4b3d33e20c81452faf9db4b9c66fdb47972d7128471f1a74efc4'
      );
      expect(primaryKey0.privateKey).toBe(
        'b6edd29f9d2b88729bdd335f9b4522914b49a9d876b917b285aa08ec1da1a98e'
      );

      const attestationKey0 = mks.getKeyForPurpose('attestation', 0);
      expect(attestationKey0.publicKey).toBe(
        '0324c5200704eef7c1a66794eec07dd68c8066d05326ba82e9c7c8707bd8060791'
      );
      expect(attestationKey0.privateKey).toBe(
        '2bc2746107313afe8da947ed3c7c1244d365dcc3293af5f5accedb2a37ba7dbd'
      );
    });

    it(`errors when called with an unknown purpose`, async () => {
      expect.assertions(1);
      try {
        mks.getKeyForPurpose('biometric', 0);
      } catch (e) {
        expect(e.message).toBe('Unknown proof purpose: biometric');
      }
    });
  });
});
