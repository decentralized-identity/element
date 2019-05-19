const element = require('../../index');

const {
  storage,
  primaryKeypair,
  primaryKeypair2,
  secondaryKeypair,
  recoveryKeypair,
  recoveryKeypair2,
} = require('../__tests__/__fixtures__');

// We need only support 1 op per did.
// NOTE: These tests, do not test syncing, so validation does not occurs for order or signatures.
// See: https://github.com/decentralized-identity/sidetree/issues/173
describe('operationsToAnchorFile', () => {
  it('create', async () => {
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

    expect(encodedOperation).toMatchSnapshot();

    const anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [encodedOperation],
      storage,
    });
    expect(anchorFileHash).toBe('QmXtnsawdNkTMBUWEBR1kTTP1gefcQiWG6aJQVq9pgrqNy');
    const anchorFile = await storage.read('QmXtnsawdNkTMBUWEBR1kTTP1gefcQiWG6aJQVq9pgrqNy');
    expect(anchorFile.didUniqueSuffixes[0]).toBe('MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('update', async () => {
    const encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      previousOperationHash: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      patch: [
        {
          op: 'replace',
          path: '/publicKey/2',
          value: {
            id: '#secondary',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: secondaryKeypair.publicKey,
          },
        },
      ],
    });
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'update',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });
    expect(encodedOperation).toMatchSnapshot();

    const anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [encodedOperation],
      storage,
    });
    expect(anchorFileHash).toBe('QmcLhmvUqEinBgdjm3bbLUXjnVuR9uhZPFVztpH7UJZSZQ');
    const anchorFile = await storage.read('QmcLhmvUqEinBgdjm3bbLUXjnVuR9uhZPFVztpH7UJZSZQ');
    expect(anchorFile.didUniqueSuffixes[0]).toBe('MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('recover', async () => {
    const encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      previousOperationHash: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      patch: [
        // first op should update recovery key.
        {
          op: 'replace',
          path: '/publicKey/1',
          value: {
            id: '#recovery',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: recoveryKeypair2.publicKey,
          },
        },
        {
          op: 'replace',
          path: '/publicKey/0',
          value: {
            id: '#primary',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: primaryKeypair2.publicKey,
          },
        },
      ],
    });
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'recover',
        kid: '#recovery',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });
    expect(encodedOperation).toMatchSnapshot();

    const anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [encodedOperation],
      storage,
    });
    expect(anchorFileHash).toBe('QmUzCXShDkfaoYYFLSubjw3oKAit8LJoYx1S5YvcghvvNr');
    const anchorFile = await storage.read('QmUzCXShDkfaoYYFLSubjw3oKAit8LJoYx1S5YvcghvvNr');
    expect(anchorFile.didUniqueSuffixes[0]).toBe('MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('delete', async () => {
    const encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
    });
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'delete',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });
    expect(encodedOperation).toMatchSnapshot();

    const anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [encodedOperation],
      storage,
    });
    expect(anchorFileHash).toBe('QmaDD5M6uczyWJD3ua5RpAttMPirEef7APLhrBexHqrEGc');
    const anchorFile = await storage.read('QmaDD5M6uczyWJD3ua5RpAttMPirEef7APLhrBexHqrEGc');
    expect(anchorFile.didUniqueSuffixes[0]).toBe('MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });
});
