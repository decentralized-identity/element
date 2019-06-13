const fixtures = require('../__tests__/__fixtures__');
const Sidetree = require('./Sidetree');

const element = require('../../index');
const config = require('../json/config.local.json');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  const storage = element.storage.ipfs.configure({
    multiaddr: config.ipfsApiMultiAddr,
  });

  const db = new element.adapters.database.ElementPouchDBAdapter({
    name: 'element-pouchdb',
  });

  const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

  const blockchain = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.mnemonic,
    providerUrl: config.web3ProviderUrl,
    // when not defined, a new contract is created.
    // anchorContractAddress: config.anchorContractAddress,
  });

  await db.deleteDB();
  await blockchain.resolving;
  sidetree = new Sidetree({
    blockchain,
    storage,
    serviceBus,
    db,
  });
  await sidetree.saveOperationFromRequestBody(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );
});

afterAll(async () => {
  await sidetree.close();
});

describe('Sidetree', () => {
  it('can resolve a specific did', async () => {
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('can resolve a specific did from cache', async () => {
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('can resolve a specific did with new updates & cache', async () => {
    await sidetree.saveOperationFromRequestBody(
      fixtures.operationGenerator.updateRecoveryKey(
        'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
        fixtures.recoveryKeypair2,
        fixtures.primaryKeypair2,
        fixtures.recoveryKeypair,
      ),
    );
    // expire cache
    await sidetree.sleep(5);

    let didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.publicKey[0].publicKeyHex).toBe(fixtures.primaryKeypair2.publicKey);

    didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.publicKey[0].publicKeyHex).toBe(fixtures.primaryKeypair2.publicKey);
  });

  it('can resolve all dids', async () => {
    const tree = await sidetree.resolve();
    expect(Object.keys(tree)).toEqual([
      'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      'transactionTime',
    ]);

    expect(
      tree['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[0].publicKeyHex,
    ).toEqual(fixtures.primaryKeypair2.publicKey);
  });
});
