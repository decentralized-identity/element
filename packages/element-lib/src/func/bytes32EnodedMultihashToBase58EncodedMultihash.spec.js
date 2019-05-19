const element = require('../../index');

describe('bytes32EnodedMultihashToBase58EncodedMultihash', () => {
  it('should encode as base58', async () => {
    const result = element.func.bytes32EnodedMultihashToBase58EncodedMultihash(
      '0xcd12c23f653b9abc436e390b59178678ce7acb6b9fa8a19e509e2313c4e55328',
    );
    expect(result).toBe('Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD');
  });
});
