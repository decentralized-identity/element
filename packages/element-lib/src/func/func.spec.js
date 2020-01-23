const {
  payloadToHash,
  signEncodedPayload,
  verifyOperationSignature,
  encodeJson,
  base58EncodedMultihashToBytes32,
  bytes32EnodedMultihashToBase58EncodedMultihash,
  objectToMultihash,
  toFullyQualifiedDidDocument,
  getOrderedOperations,
} = require('.');
const { MnemonicKeySystem } = require('../../index');
const sidetreeCreatePayload = require('../__tests__/__fixtures__/sidetreeCreatePayload');
const fullyQualifiedEdvDidDoc = require('../__tests__/__fixtures__/fullyQualifiedEdvDidDoc.json');
const unqualifiedEdvDidDoc = require('../__tests__/__fixtures__/unqualifiedEdvDidDoc.json');
const unorderedOperations = require('../__tests__/__fixtures__/unorderedOperations.json');

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
    const signature = signEncodedPayload(
      encodedHeader,
      encodedPayload,
      primaryKey.privateKey
    );
    expect(signature).toBeDefined();
    // Verify
    const valid = verifyOperationSignature(
      encodedHeader,
      encodedPayload,
      signature,
      primaryKey.publicKey
    );
    expect(valid).toBeTruthy();
  });
});

describe('base58EncodedMultihashToBytes32', () => {
  it('should encode as bytes32', async () => {
    const result = base58EncodedMultihashToBytes32(
      'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
    );
    expect(result).toBe(
      '0xcd12c23f653b9abc436e390b59178678ce7acb6b9fa8a19e509e2313c4e55328'
    );
  });
});

describe('bytes32EnodedMultihashToBase58EncodedMultihash', () => {
  it('should encode as base58', async () => {
    const result = bytes32EnodedMultihashToBase58EncodedMultihash(
      '0xcd12c23f653b9abc436e390b59178678ce7acb6b9fa8a19e509e2313c4e55328'
    );
    expect(result).toBe('Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD');
  });
});

describe('objectToMultihash', () => {
  it('should return the content id of an object', async () => {
    const aliceEncodedCreateOp =
      'eyJoZWFkZXIiOnsib3BlcmF0aW9uIjoiY3JlYXRlIiwia2lkIjoiI2tleTEiLCJhbGciOiJFUzI1NksiLCJwcm9vZk9mV29yayI6e319LCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdlpHbGtMM1l4SWl3aWNIVmliR2xqUzJWNUlqcGJleUpwWkNJNklpTnJaWGt4SWl3aWRIbHdaU0k2SWxObFkzQXlOVFpyTVZabGNtbG1hV05oZEdsdmJrdGxlVEl3TVRnaUxDSndkV0pzYVdOTFpYbElaWGdpT2lJd01qUTVZakprTUdRNU1qWXlNbUprWmpFNU5HRXlZV1k1TUdZNVpERTJObVV3WkdRek1qUmhabVk1WWpReVl6ZzNNamRrWlRrd1pUZzROMlEzTm1FMFpHTWlmVjE5Iiwic2lnbmF0dXJlIjoiQUFmcFBjVVJibmNhVFdvLTk1TUY2eHZMYXZ6YjZ3bDgxdWZoU1ZjQTRZUS1xeVJkLWJBV1gxTGpFY09wQ0Z3ZkVYVzFxV3VfSTVyNE5BeVJyMU4yZEEifQ';
    const mhash = await objectToMultihash(aliceEncodedCreateOp);
    expect(mhash).toBe('QmVuCdToH535yi5ByW9dJJQTwg9v67PWQydLabdPMWJw2p');
  });
});

describe('toFullyQualifiedDidDocument', () => {
  it('should change id properties', async () => {
    const fullyQualifiedDidDoc = toFullyQualifiedDidDocument(
      unqualifiedEdvDidDoc
    );
    expect(fullyQualifiedDidDoc).toEqual(fullyQualifiedEdvDidDoc);
  });
});

describe('getOrderedOperations', () => {
  it('should order a list of operations', async () => {
    expect(unorderedOperations[0].transaction.transactionNumber).toBe(814);
    expect(unorderedOperations[1].transaction.transactionNumber).toBe(812);
    expect(unorderedOperations[2].transaction.transactionNumber).toBe(813);
    const orderedOperations = getOrderedOperations(unorderedOperations);
    expect(orderedOperations[0].transaction.transactionNumber).toBe(812);
    expect(orderedOperations[1].transaction.transactionNumber).toBe(813);
    expect(orderedOperations[2].transaction.transactionNumber).toBe(814);
  });
});
