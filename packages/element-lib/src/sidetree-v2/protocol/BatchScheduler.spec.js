const BatchScheduler = require('./BatchScheduler');
const { getCreatePayloadForKeyIndex, getTestSideTree } = require('../test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();
const batchScheduler = new BatchScheduler(sidetree);

describe('BatchScheduler', () => {
  describe('writeNow', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());

    it('should submit a transaction now', async () => {
      const createPayload = await getCreatePayloadForKeyIndex(mks, 0);
      const transaction = await batchScheduler.writeNow(createPayload);
      expect(transaction).toBeDefined();
    });
  });

  describe('writeOperationBatch', () => {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    let createPayload1;
    let createPayload2;
    let createPayload3;
    let didUniqueSuffix1;
    let didUniqueSuffix2;
    let didUniqueSuffix3;

    beforeAll(async () => {
      createPayload1 = await getCreatePayloadForKeyIndex(mks, 0);
      createPayload2 = await getCreatePayloadForKeyIndex(mks, 1);
      createPayload3 = await getCreatePayloadForKeyIndex(mks, 2);
      didUniqueSuffix1 = sidetree.func.getDidUniqueSuffix(createPayload1);
      didUniqueSuffix2 = sidetree.func.getDidUniqueSuffix(createPayload2);
      didUniqueSuffix3 = sidetree.func.getDidUniqueSuffix(createPayload3);
      await sidetree.operationQueue.enqueue(didUniqueSuffix1, createPayload1);
      await sidetree.operationQueue.enqueue(didUniqueSuffix2, createPayload2);
      await sidetree.operationQueue.enqueue(didUniqueSuffix3, createPayload3);
    });

    it('should process a batch of operations', async () => {
      await batchScheduler.writeOperationBatch();
      await sidetree.sync();
      const didDocument1 = await sidetree.resolve(didUniqueSuffix1);
      expect(didDocument1.id).toContain(didUniqueSuffix1);
      const didDocument2 = await sidetree.resolve(didUniqueSuffix2);
      expect(didDocument2.id).toContain(didUniqueSuffix2);
      const didDocument3 = await sidetree.resolve(didUniqueSuffix3);
      expect(didDocument3.id).toContain(didUniqueSuffix3);
    });
  });
});
