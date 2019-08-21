const element = require('../../index');

const {
  storage,
  blockchain,
  primaryKeypair,
  recoveryKeypair,
} = require('../__tests__/__fixtures__');

describe('operationsToTransaction', () => {
  it('should batch and anchor operations to blockchain', async () => {
    const encodedPayload = element.func.encodeJson({
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#primary',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: primaryKeypair.publicKey,
        },
        {
          id: '#recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: recoveryKeypair.publicKey,
        },
      ],
    });
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'create',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    const txn = await element.func.operationsToTransaction({
      operations: [encodedOperation],
      storage,
      blockchain,
    });
    expect(txn).toEqual({
      anchorFileHash: 'QmXtnsawdNkTMBUWEBR1kTTP1gefcQiWG6aJQVq9pgrqNy',
      transactionNumber: 15,
      transactionTime: 53,
      transactionTimeHash: '0xa6dd7120730ddccf4788a082b0b5607fd1f39dbb80ebc170678551878b90b835',
    });
  });
});
