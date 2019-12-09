const {
  payloadToHash,
  signEncodedPayload,
  verifyOperationSignature,
  encodeJson,
} = require('./func');
const { MnemonicKeySystem } = require('../../index');

// eslint-disable-next-line
const sidetreeCreatePayload = { '@context': 'https://w3id.org/did/v1', publicKey: [{ id: '#recoveryKey', type: 'Secp256k1VerificationKey2018', usage: 'recovery', publicKeyHex: '031efa0144680ccb2e691937125472f0277be474ed51e8cf70bf466698b0883154' }, { id: '#signingKey', type: 'Secp256k1VerificationKey2018', usage: 'signing', publicKeyHex: '038861f5dd163bc804b2061bdf7f297c636f52e5e4f2bf219b21a257f84a9ac60a' }], service: [{ type: 'IdentityHub', serviceEndpoint: { '@context': 'schema.identity.foundation/hub', '@type': 'UserServiceEndpoint', instance: ['dummyHubUri1', 'dummyHubUri2'] } }] };

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
