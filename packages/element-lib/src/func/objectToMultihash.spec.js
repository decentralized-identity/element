const objectToMultihash = require('./objectToMultihash');

const { aliceEncodedCreateOp } = require('../__tests__/__fixtures__');

describe('objectToMultihash', () => {
  it('should return the content id of an object', async () => {
    const mhash = await objectToMultihash(aliceEncodedCreateOp);
    expect(mhash).toBe('QmVuCdToH535yi5ByW9dJJQTwg9v67PWQydLabdPMWJw2p');
  });
});
