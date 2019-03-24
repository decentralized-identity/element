const element = require('../../../index');

const { aliceEncodedCreateOp, storage } = require('../../__tests__/__fixtures__');

describe('operationsToAnchorFile', () => {
  it('should batch and anchor operations to storage', async () => {
    const anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [aliceEncodedCreateOp],
      storage,
    });
    expect(anchorFileHash).toBe('QmNovBcAAXy5tgq5gvE1Mbw8MuX2dzkJA8azbUZxFBKKNR');
  });
});
