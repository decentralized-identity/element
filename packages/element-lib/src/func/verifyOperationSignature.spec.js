const element = require('../../index');

const { aliceKeys, aliceEncodedCreateOp } = require('../__tests__/__fixtures__');

describe('verifyOperationSignature', () => {
  it('should sign and encode a json patch operation', async () => {
    const valid = await element.func.verifyOperationSignature({
      operation: aliceEncodedCreateOp,
      publicKey: aliceKeys.publicKey,
    });
    expect(valid).toBe(true);
  });
});
