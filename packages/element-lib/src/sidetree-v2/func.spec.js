const {
  payloadToHash,
  signEncodedPayload,
  verifyOperationSignature,
  encodeJson,
  base58EncodedMultihashToBytes32,
} = require('./func');
const { MnemonicKeySystem } = require('../../index');
const sidetreeCreatePayload = require('./__fixtures__/sidetreeCreatePayload.json');

describe('payloadToHash', () => {
  it('should compute the right encodedHash', async () => {
    const hash = payloadToHash(sidetreeCreatePayload);
    expect(hash).toBe('EiAOjDV4QHxtOoCVnhjeV83sbyErH_XgaUJJYqLOAsfAcQ');
  });
});

describe('sign and verify', () => {
  it('should sign and verify a sidetree payload', async () => {
    const header = {
      operation: 'create',
      kid: '#primary',
      alg: 'ES256K',
    };
    const encodedHeader = encodeJson(header);
    const encodedPayload = encodeJson(sidetreeCreatePayload);
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    const primaryKey = await mks.getKeyForPurpose('primary', 0);
    // Sign
    const signature = signEncodedPayload(encodedHeader, encodedPayload, primaryKey.privateKey);
    expect(signature).toBeDefined();
    // Verify
    const valid = verifyOperationSignature(
      encodedHeader,
      encodedPayload,
      signature,
      primaryKey.publicKey,
    );
    expect(valid).toBeTruthy();
  });
});

describe('base58EncodedMultihashToBytes32', () => {
  it('should encode as bytes32', async () => {
    const result = base58EncodedMultihashToBytes32(
      'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD',
    );
    expect(result).toBe('0xcd12c23f653b9abc436e390b59178678ce7acb6b9fa8a19e509e2313c4e55328');
  });
});
