const { isKeyValid, isDidDocumentModelValid } = require('./validation');

describe('isKeyValid', () => {
  it('should fail if key does not contain id', async () => {
    const key = {
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key does not contain type', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key contains invalid type', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'invalidType',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key does not contain usage', async () => {
    const key = {
      id: '#primary',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key contains invalid usage', async () => {
    const key = {
      id: '#primary',
      usage: 'invalidUsage',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key contains an invalidKey encoding', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyWrongEncoding:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should fail if key contains additional properties', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
      other: 'property',
    };
    expect(() => isKeyValid(key)).toThrow();
  });

  it('should pass a valid key', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(isKeyValid(key)).toBeTruthy();
  });

  it('should pass if key contains a controller property', async () => {
    const key = {
      id: '#primary',
      usage: 'signing',
      controller: 'did:foo:bar',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex:
        '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
    };
    expect(isKeyValid(key)).toBeTruthy();
  });
});

describe('isDidDocumentValid', () => {
  it('should fail is doc does not contain a @context', async () => {
    const didDocumentModel = {
      publicKey: [
        {
          id: '#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
        {
          id: '#recovery',
          usage: 'recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
      ],
    };
    expect(() => isDidDocumentModelValid(didDocumentModel)).toThrow();
  });

  it('should fail is doc does not contain a publicKey array', async () => {
    const didDocumentModel = {
      '@context': 'https://w3id.org/did/v1',
    };
    expect(() => isDidDocumentModelValid(didDocumentModel)).toThrow();
  });

  it('should fail if doc contains an invalid public key', async () => {
    const didDocumentModel = {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
        {
          id: '#recovery',
          // Missing usage property
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
      ],
    };
    expect(() => isDidDocumentModelValid(didDocumentModel)).toThrow();
  });

  it('should fail if doc contains additional properties', async () => {
    const didDocumentModel = {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
        {
          id: '#recovery',
          usage: 'recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
      ],
      other: 'property',
    };
    expect(() => isDidDocumentModelValid(didDocumentModel)).toThrow();
  });

  it('should pass a valid did document', async () => {
    const didDocumentModel = {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
        {
          id: '#recovery',
          usage: 'recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex:
            '025aad7a926a2c86f98b7687e1a6a8207aad49babc7d6f7d659f3e4304f980a124',
        },
      ],
    };
    expect(isDidDocumentModelValid(didDocumentModel)).toBeTruthy();
  });
});
