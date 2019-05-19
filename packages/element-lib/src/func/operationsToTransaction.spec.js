const element = require('../../index');

const { aliceEncodedCreateOp, storage, blockchain } = require('../__tests__/__fixtures__');

describe('operationsToTransaction', () => {
  it('should batch and anchor operations to blockchain', async () => {
    const txn = await element.func.operationsToTransaction({
      operations: [aliceEncodedCreateOp],
      storage,
      blockchain,
    });
    expect(txn).toEqual({
      anchorFileHash: 'QmNovBcAAXy5tgq5gvE1Mbw8MuX2dzkJA8azbUZxFBKKNR',
      transactionNumber: 15,
      transactionTime: 53,
      transactionTimeHash: '0xa6dd7120730ddccf4788a082b0b5607fd1f39dbb80ebc170678551878b90b835',
    });
  });
});
