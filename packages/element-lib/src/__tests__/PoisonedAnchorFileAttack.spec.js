const nanobus = require('nanobus');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-upsert'));

const fixtures = require('../__tests__/__fixtures__');
const Sidetree = require('../sidetree/Sidetree');

const element = require('../../index');
const config = require('../json/config.local.json');

jest.setTimeout(10 * 1000);

const sleep = seconds => new Promise(r => setTimeout(r, seconds * 1000));

let sidetree;
let blockchain;
let serviceBus;

describe('Poisoned Anchor File Attack', () => {
  beforeAll(async () => {
    serviceBus = nanobus();
    const db = new PouchDB('element-pouchdb.Poisoned');
    // eslint-ignore-next-line

    try {
      db.createIndex({
        index: { fields: ['type', 'anchorFileHash', 'operationHash', 'batchFileHash'] },
      });
    } catch (e) {
      // no update conflict
    }

    const storage = element.storage.ipfs.configure({
      multiaddr: config.ipfsApiMultiAddr,
    });

    blockchain = element.blockchain.ethereum.configure({
      hdPath: "m/44'/60'/0'/0/0",
      mnemonic: config.mnemonic,
      providerUrl: config.web3ProviderUrl,
      // when not defined, a new contract is created.
      // anchorContractAddress: config.anchorContractAddress,
    });

    await db
      .allDocs()
      .then(result => Promise.all(result.rows.map(row => db.remove(row.id, row.value.rev))));
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

    await sleep(1);
  });

  it('survives small poison', async (done) => {
    // Insert poison
    await blockchain.write('QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43');

    let count = 0;
    serviceBus.on('element:sidetree:transaction:failing', () => {
      count++;
      if (count === 1) {
        done();
      }
    });

    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('skips poison after it is discovered', async () => {
    
    await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  afterAll(async () => {
    await sleep(5);
    await sidetree.close();
  });
});
