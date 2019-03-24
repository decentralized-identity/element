const element = require('../../../index');

describe('ledger', () => {
  beforeAll(async () => {
    process.env.ELEMENT_MNEUMONIC = 'hazard pride garment scout search divide solution argue wait avoid title cave';
    process.env.ELEMENT_PROVIDER = 'http://localhost:8545';
    await element.ledger.createNewContract();
  });

  describe('getBlockchainTime', () => {
    it('should return hash and blocknumber', async () => {
      const result = await element.ledger.getBlockchainTime(0);
      expect(result.time).toBe(0);
      expect(result.hash).toBeDefined();
    });
  });

  describe('getTransactions', () => {
    it('should return transactions from blockNumber', async () => {
      const txns = await element.ledger.getTransactions(0);
      expect(txns).toEqual([]);
    });
  });

  describe('write', () => {
    it('should return a element transaction for an anchorFileHash', async () => {
      const txn = await element.ledger.write('Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD');
      expect(txn.anchorFileHash).toBe('Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD');
      const txns = await element.ledger.getTransactions(0);
      expect(txns[0].anchorFileHash).toBe('Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD');
    });
  });
});
