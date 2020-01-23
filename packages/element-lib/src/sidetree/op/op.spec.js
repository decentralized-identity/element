const { isDidDocumentModelValid } = require('../utils/validation');
const element = require('../../../index');

describe('op', () => {
  it('getNewWallet', async () => {
    const wallet = await element.op.getNewWallet();
    expect(Object.values(wallet.keys)[1].tags.length).toBe(3);
    expect(wallet).toBeDefined();

    const didDoc = element.op.walletToInitionalDIDDoc(wallet);
    expect(isDidDocumentModelValid(didDoc)).toBeTruthy();
    // console.log(didDoc);
  });
});
