const { isDidDocumentModelValid } = require('../utils/validation');
const {
  didMethodName,
  getTestSideTree,
} = require('../../__tests__/test-utils');

const sidetree = getTestSideTree();

describe('op', () => {
  it('getNewWallet', async () => {
    const wallet = await sidetree.op.getNewWallet();
    expect(wallet).toBeDefined();
    expect(Object.values(wallet.keys)[1].tags.length).toBe(3);
    expect(Object.values(wallet.keys)[0].tags[2]).toContain(didMethodName);

    const didDoc = sidetree.op.walletToInitialDIDDoc(wallet);
    expect(isDidDocumentModelValid(didDoc)).toBeTruthy();
  });
});
