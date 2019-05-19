const element = require('../../index');

describe('base58EncodedMultihashToBytes32', () => {
  it('should encode as bytes32', async () => {
    const result = element.func.base58EncodedMultihashToBytes32(
      'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD',
    );
    expect(result).toBe('0xcd12c23f653b9abc436e390b59178678ce7acb6b9fa8a19e509e2313c4e55328');
  });
});
