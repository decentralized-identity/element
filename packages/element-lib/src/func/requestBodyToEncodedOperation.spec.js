const element = require('../../index');

describe('element.func.requestBodyToEncodedOperation', () => {
  // TODO: in the future Proof of Work.
  it('encodes a client request as an operation', async () => {
    const keys = await element.func.createKeys();
    const payload = {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#key1',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: keys.publicKey,
        },
      ],
    };
    const encodedPayload = element.func.encodeJson(payload);
    const signature = element.func.signEncodedPayload(encodedPayload, keys.privateKey);
    const requestBody = {
      header: {
        operation: 'create',
        kid: '#key1',
        alg: 'ES256K',

      },
      payload: encodedPayload,
      signature,
    };

    // happens on the server..
    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    const decodedOperation = element.func.decodeJson(encodedOperation);

    // always
    expect(decodedOperation.signature).toEqual(requestBody.signature);

    // always
    expect(decodedOperation.payload).toEqual(requestBody.payload);

    // For now, later when proof of work is added, maybe not.
    expect(decodedOperation.header).toEqual(requestBody.header);
  });
});
