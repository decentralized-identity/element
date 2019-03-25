const element = require('../../index');

describe('web3', () => {
  beforeAll(() => {
    process.env.ELEMENT_MNEUMONIC = 'hazard pride garment scout search divide solution argue wait avoid title cave';
    process.env.ELEMENT_PROVIDER = 'http://localhost:8545';
  });

  it('element has web3 helper that works', async () => {
    const web3 = element.ledger.getWeb3({
      mneumonic: process.env.ELEMENT_MNEUMONIC,
      providerUrl: process.env.ELEMENT_PROVIDER,
    });
    const accounts = await web3.eth.getAccounts();
    expect(accounts[0]).toBe('0x1E228837561e32a6eC1b16f0574D6A493Edc8863');
  });

  it('element can create new anchor contract', async () => {
    const instance = await element.ledger.createNewContract();
    expect(element.ledger.getContractAddress()).toBe(instance.address);
  });

  afterAll(() => {
    // web3.currentProvider.engine.stop();
  });
});
