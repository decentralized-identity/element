const batchService = require('../batchService');

describe('batchService', () => {
  beforeAll(() => {
    batchService.deleteBatchFile();
  });
  describe('getBatch', () => {
    it('returns the current batchFile', async () => {
      const batchFile = await batchService.getBatchFile();
      expect(batchFile.operations.length).toBe(0);
    });
  });

  describe('addOp', () => {
    it('adds an operation to the current batchFile', async () => {
      const op = 'AAABB';
      await batchService.addOp(op);
      const batchFile = await batchService.getBatchFile();
      expect(batchFile.operations.length).toBe(1);
      expect(batchFile.operations[0]).toBe(op);
    });
  });

  afterAll(() => {
    batchService.deleteBatchFile();
    batchService.teardown();
  });
});
