/* eslint-disable no-underscore-dangle */
const element = require('../../../../../index');
const utils = require('../utils');

const config = require('../../../json/config.local.json');

describe('blockchain.ethereum', () => {
  let blockchain;

  beforeAll(() => {
    blockchain = element.blockchain.ethereum.configure({
      hdPath: "m/44'/60'/0'/0/0",
      mnemonic: config.mnemonic,
      providerUrl: config.web3ProviderUrl,
      // when not defined, a new contract is created.
      // anchorContractAddress: config.anchorContractAddress,
    });
  });

  describe('configure', () => {
    it('can get web3 accounts', async () => {
      const accounts = await blockchain.web3.eth.getAccounts();
      expect(accounts[0]).toBe('0x1E228837561e32a6eC1b16f0574D6A493Edc8863');
    });

    it('can create new contracts on the fly', async () => {
      const accounts = await utils.getAccounts(blockchain.web3);
      const instance = await blockchain._createNewContract(accounts[0]);
      expect(blockchain.anchorContractAddress).toBe(instance.address);
    });
  });

  describe('getBlockchainTime', () => {
    it('should return hash and blocknumber', async () => {
      const time = await utils.getBlockchainTime(blockchain.web3, 0);
      expect(typeof time).toBe('number');
    });
  });

  describe('getTransactions', () => {
    it('should return transactions from blockNumber', async () => {
      const txns = await blockchain.getTransactions(0);
      expect(txns).toEqual([]);
    });
  });

  describe('write', () => {
    it('should return a element transaction for an anchorFileHash', async () => {
      const txn = await blockchain.write(
        'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
      );
      expect(txn.anchorFileHash).toBe(
        'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
      );
      const txns = await blockchain.getTransactions(0);
      expect(txns[0].anchorFileHash).toBe(
        'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
      );
    });
  });
});
