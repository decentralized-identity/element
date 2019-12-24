const crypto = require('.');

describe('createKeys', () => {
  it('create a new hex encoded compressed secp256k1 keypair', async () => {
    const { publicKey, privateKey } = crypto.secp256k1.createKeys();
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
  });
});
