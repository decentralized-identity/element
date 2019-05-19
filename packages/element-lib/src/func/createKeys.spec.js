const element = require('../../index');

describe('createKeys', () => {
  it('create a new hex encoded compressed secp256k1 keypair', async () => {
    const { publicKey, privateKey } = element.func.createKeys();
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
  });
});
