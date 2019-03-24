const SimpleSidetreeAnchor = artifacts.require('./SimpleSidetreeAnchor.sol');

const anchorFileHash = '0x3ddbe2be8cfc5313f6160bfa263651f000fb70e5a6af72f3de798fa58933f3d9';

contract('SimpleSidetreeAnchor', (accounts) => {
  let instance;

  before(async () => {
    instance = await SimpleSidetreeAnchor.deployed();
  });

  it('contract is deployed', async () => {
    expect(instance);
    // console.log(accounts)
  });

  it('can write anchor', async () => {
    const receipt = await instance.anchorHash(anchorFileHash, {
      from: accounts[0],
    });
    assert(receipt.logs.length === 1);
    const [log] = receipt.logs;
    assert(log.event === 'Anchor');
    assert(log.args.anchorFileHash === anchorFileHash);
    assert(log.args.transactionNumber.toNumber() === 0);
  });

  it('can read anchor', async () => {
    const events = await instance.getPastEvents('Anchor', {
      fromBlock: 0,
      toBlock: 'latest',
    });
    assert(events.length === 1);
  });

  it('can listen for anchor', (done) => {
    instance.Anchor(async (err, log) => {
      assert(log.args.anchorFileHash === anchorFileHash);
      assert(log.args.transactionNumber.toNumber() === 1);
      done();
    });

    instance.anchorHash(anchorFileHash, {
      from: accounts[0],
    });
  });
});
