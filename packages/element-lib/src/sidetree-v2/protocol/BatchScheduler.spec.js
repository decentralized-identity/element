const BatchScheduler = require('./BatchScheduler');
const { getCreatePayloadForKeyIndex, getTestSideTree } = require('../test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();
const batchScheduler = new BatchScheduler(sidetree);

describe('BatchScheduler', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());

  it('should submit a transaction now', async () => {
    const createPayload = await getCreatePayloadForKeyIndex(mks, 0);
    const transaction = await batchScheduler.writeNow(createPayload);
    expect(transaction).toBeDefined();
  });
});
