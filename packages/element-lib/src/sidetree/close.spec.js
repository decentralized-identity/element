const element = require('../../index');

let sidetree;

beforeAll(async () => {
  const config = {
    ethereum: {
      provider_url: 'http://127.0.0.1:8545',
      mnemonic: 'hazard pride garment scout search divide solution argue wait avoid title cave',
    },
    ipfs: {
      multiaddr: '/ip4/127.0.0.1/tcp/5007',
    },
  };
  const storage = element.storage.ipfs.configure({
    multiaddr: config.ipfs.multiaddr,
  });

  const db = new element.adapters.database.ElementRXDBAdapter({
    name: 'element-pouchdb.close',
    adapter: 'memory',
  });

  const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

  const blockchain = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.ethereum.mnemonic,
    providerUrl: config.ethereum.provider_url,
    // when not defined, a new contract is created.
    // anchorContractAddress: config.anchorContractAddress,
  });

  await db.deleteDB();

  await blockchain.resolving;
  sidetree = new element.Sidetree({
    blockchain,
    storage,
    serviceBus,
    db,
  });
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.close', () => {
  it('closes after blockchain write', async () => {
    await sidetree.blockchain.write('QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43');
  });
});
