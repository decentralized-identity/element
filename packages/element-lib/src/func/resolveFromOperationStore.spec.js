// we need a better abstraction for this...
const nanobus = require('nanobus');

const fixtures = require('../__tests__/__fixtures__');

const { generateCreates, generateUpdate1, generateActor } = fixtures;
const config = require('../json/config.local.json');

const element = require('../../index');
const produceOperations = require('./produceOperations');
const resolveFromOperationStore = require('./resolveFromOperationStore');
const InMemoryOpStore = require('../operationStore/InMemoryOpStore');

let blockchain;
let storage;
const count = 3;
const actorMap = {};
let createOperations;
let updateOperations;
let model;
let lastTransactionTime;
let doc;

const opStore = new InMemoryOpStore();

jest.setTimeout(20 * 1000);

describe('resolveFromOperationStore', () => {
  beforeAll(async () => {
    blockchain = element.blockchain.ethereum.configure({
      hdPath: "m/44'/60'/0'/0/0",
      mnemonic: config.mnemonic,
      providerUrl: config.web3ProviderUrl,
    });

    // wait for new contract.
    await blockchain.resolving;

    storage = element.storage.ipfs.configure({
      multiaddr: config.ipfsApiMultiAddr,
    });

    for (let i = 0; i < count; i++) {
      const actor = generateActor();
      actorMap[actor.uid] = actor;
    }
    createOperations = await generateCreates(actorMap);
    updateOperations = await generateUpdate1(actorMap);
    await element.func.operationsToTransaction({
      operations: [...createOperations],
      storage,
      blockchain,
    });

    await element.func.operationsToTransaction({
      operations: [...updateOperations],
      storage,
      blockchain,
    });
    model = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });
    // eslint-disable-next-line
    ({ doc, lastTransactionTime } = Object.values(model)[0]);
  });

  it('can process multiple txns', (done) => {
    // expect.assertions(8);

    const bus = nanobus();

    let opCount = 0;
    bus.on('element:sidetree:operations', (anchoredOperations) => {
      expect(anchoredOperations).toBeDefined();
      opStore.addOperations(anchoredOperations);
      opCount++;
      if (opCount === 2) {
        done();
      }
    });

    produceOperations({
      bus,
      fromTransactionTime: lastTransactionTime - 1,
      toTransactionTime: lastTransactionTime,
      blockchain,
      storage,
    });
  });

  it('can resolve a DID record from opStore', async () => {
    const record = await resolveFromOperationStore(opStore, element.reducer, doc.id);
    expect(record.doc.id).toBe(doc.id);
  });

  it('can resolve a everything from opStore (DO NOT USE)', async () => {
    model = await resolveFromOperationStore(opStore, element.reducer);
    // should produce a model like syncAll
    // console.log(model);
    expect(model).toBeDefined();
  });
});
