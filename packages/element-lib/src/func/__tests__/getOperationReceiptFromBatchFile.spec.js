const element = require('../../../index');

const {
  aliceCreateBatchFile,
  aliceCreateAnchorFile,
  aliceEncodedCreateOp,
} = require('../../__tests__/__fixtures__');

describe('getOperationReceiptFromBatchFile', () => {
  it('should return a base64Url encoded merkle proof receipt', async () => {
    const receipt = await element.func.getOperationReceiptFromBatchFile({
      batchFile: aliceCreateBatchFile,
      operation: aliceEncodedCreateOp,
    });
    expect(receipt).toBe('W10');
  });

  it('should work with verify with 1 op', async () => {
    const receipt = await element.func.getOperationReceiptFromBatchFile({
      batchFile: aliceCreateBatchFile,
      operation: aliceEncodedCreateOp,
    });

    const included = await element.func.verifyOperationInclusion({
      receipt,
      merkleRoot: aliceCreateAnchorFile.merkleRoot,
      operation: aliceEncodedCreateOp,
    });

    expect(included).toBe(true);
  });

  it.skip('should work with verify with 2 op', async () => {
    // not implemented
  });
});
