const { isKeyValid } = require('./validation');

describe('isKeyValid', () => {
  it('should fail if key does not contain id', async () => {
    const key = {
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key does not contain type', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key contains invalid type', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'invalidType',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key does not contain usage', async () => {
    const key = {
      id: '#primary',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key contains invalid usage', async () => {
    const key = {
      id: '#primary',
      usage: 'invalidUsage',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key does not contain publicKeyHex', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key contains additional properties', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
      other: 'property',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should pass a valid key', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(isKeyValid(key)).toBeTruthy();
  });

  it('should pass if key contains a controller property', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      controller: 'did:foo:bar',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(isKeyValid(key)).toBeTruthy();
  });
});
