const ElementCore = require("@transmute/element-core");

describe("ElementCore", () => {
  describe("MnemonicKeySystem", () => {
    it("generateMnemonic", async () => {
      const mnemonic = await ElementCore.MnemonicKeySystem.generateMnemonic();
      expect(mnemonic).toBeDefined();
    });
  });

  describe("ElementWallet", () => {
    it("can add mnemonic", async () => {
      const mnemonic = await ElementCore.MnemonicKeySystem.generateMnemonic();
      const wallet = new ElementCore.ElementWallet();
      wallet.addKey({
        encoding: "bip39",
        mnemonic: mnemonic,
        notes: "",
        tags: ["did:example:456", "A"],
        type: "mnemonic"
      });
      expect(wallet).toBeDefined();
    });
  });
});
