const element = require('../../index');

const { aliceKeys, aliceEncodedCreateOp } = require('../__tests__/__fixtures__');

const decodeJson = require('./decodeJson');

describe('verifyOperationSignature', () => {
  it('should sign and encode a json patch operation', async () => {
    const valid = await element.func.verifyOperationSignature({
      operation: aliceEncodedCreateOp,
      publicKey: aliceKeys.publicKey,
    });
    expect(valid).toBe(true);
  });

  it('can handle new way', async () => {
    const decodedOperation = decodeJson(aliceEncodedCreateOp);

    const valid = await element.func.verifyOperationSignature({
      encodedOperationPayload: decodedOperation.payload,
      signature: decodedOperation.signature,
      publicKey: aliceKeys.publicKey,
    });

    expect(valid).toBe(true);
  });
});
