const element = require('../../../../../index');

const config = require('../../../json/config.local.json');

describe('mnemonic.hdpath', () => {
  describe('supports multiple addresses from same mnemonic', () => {
    it('0x1E228837561e32a6eC1b16f0574D6A493Edc8863 is 0', async () => {
      const blockchain = element.blockchain.ethereum.configure({
        hdPath: "m/44'/60'/0'/0/0",
        mnemonic: config.mnemonic,
        providerUrl: config.web3ProviderUrl,
        // when not defined, a new contract is created.
        // anchorContractAddress: config.anchorContractAddress,
      });
      const accounts = await blockchain.web3.eth.getAccounts();
      expect(accounts).toEqual(['0x1E228837561e32a6eC1b16f0574D6A493Edc8863']);
    });

    it('0x3bFE8B6CDEaD4574f187877b92b7e9AEE4B7e62C is 1', async () => {
      const blockchain = element.blockchain.ethereum.configure({
        hdPath: "m/44'/60'/0'/0/1",
        mnemonic: config.mnemonic,
        providerUrl: config.web3ProviderUrl,
        // when not defined, a new contract is created.
        // anchorContractAddress: config.anchorContractAddress,
      });
      const accounts = await blockchain.web3.eth.getAccounts();
      expect(accounts).toEqual(['0x3bFE8B6CDEaD4574f187877b92b7e9AEE4B7e62C']);
    });

    it('0x9d05e48E9eF480322de67091c5A16779D3377326 is 1337', async () => {
      const blockchain = element.blockchain.ethereum.configure({
        hdPath: "m/44'/60'/0'/0/1337",
        mnemonic: config.mnemonic,
        providerUrl: config.web3ProviderUrl,
        // when not defined, a new contract is created.
        // anchorContractAddress: config.anchorContractAddress,
      });
      const accounts = await blockchain.web3.eth.getAccounts();
      expect(accounts).toEqual(['0x9d05e48E9eF480322de67091c5A16779D3377326']);
    });
  });
});
