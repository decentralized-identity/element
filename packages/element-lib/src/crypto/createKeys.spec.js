const crypto = require('.');

describe('createKeys', () => {
  it('create a new hex encoded compressed secp256k1 keypair', async () => {
    const { publicKey, privateKey } = crypto.secp256k1.createKeys();
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
  });

  it('creates base58 encoded ed25519 keypair', async () => {
    const key = await crypto.ed25519.createKeys();
    expect(key.publicKeyBase58).toBeDefined();
    expect(key.privateKeyBase58).toBeDefined();
  });
});
