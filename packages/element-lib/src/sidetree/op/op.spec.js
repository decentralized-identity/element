const { isDidDocumentModelValid } = require('../utils/validation');
const element = require('../../../index');

describe('op', () => {
  it('getNewWallet', async () => {
    const wallet = await element.op.getNewWallet('did:methodName');
    expect(wallet).toBeDefined();
    expect(Object.values(wallet.keys)[1].tags.length).toBe(3);
    expect(Object.values(wallet.keys)[0].tags[2]).toContain('did:methodName');

    const didDoc = element.op.walletToInitialDIDDoc(wallet);
    expect(isDidDocumentModelValid(didDoc)).toBeTruthy();
  });
});
