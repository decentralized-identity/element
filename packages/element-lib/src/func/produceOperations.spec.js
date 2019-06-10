// we need a better abstraction for this...
const nanobus = require('nanobus');

const fixtures = require('../__tests__/__fixtures__');

const { generateCreates, generateUpdate1, generateActor } = fixtures;
const config = require('../json/config.local.json');

const element = require('../../index');
const produceOperations = require('./produceOperations');

let blockchain;
let storage;
const count = 3;
const actorMap = {};
let createOperations;
let updateOperations;
let model;

jest.setTimeout(20 * 1000);

describe('produceOperations', () => {
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
  });

  it('can process a single txn', (done) => {
    expect.assertions(4);
    const { txns } = Object.values(model)[0];
    const bus = nanobus();

    bus.on('element:sidetree:txn', (txn) => {
      expect(txn).toBeDefined();
    });

    bus.on('element:sidetree:anchorFile', ({ anchorFile }) => {
      expect(anchorFile).toBeDefined();
    });

    bus.on('element:sidetree:batchFile', ({ batchFile }) => {
      expect(batchFile).toBeDefined();
    });

    bus.on('element:sidetree:operations', ({ operations }) => {
      // console.log(JSON.stringify(operations, null, 2));
      expect(operations).toBeDefined();
      done();
    });

    produceOperations({
      bus,
      fromTransactionTime: txns[0].transactionTime,
      toTransactionTime: txns[0].transactionTime,
      blockchain,
      storage,
    });
  });

  it('can process multiple txns', (done) => {
    expect.assertions(8);
    const { txns } = Object.values(model)[0];
    const bus = nanobus();

    bus.on('element:sidetree:txn', (txn) => {
      expect(txn).toBeDefined();
    });

    bus.on('element:sidetree:anchorFile', ({ anchorFile }) => {
      expect(anchorFile).toBeDefined();
    });

    bus.on('element:sidetree:batchFile', ({ batchFile }) => {
      expect(batchFile).toBeDefined();
    });

    let opCount = 0;
    bus.on('element:sidetree:operations', ({ operations }) => {
      expect(operations).toBeDefined();
      opCount++;
      if (opCount === 2) {
        done();
      }
    });

    produceOperations({
      bus,
      fromTransactionTime: txns[0].transactionTime,
      toTransactionTime: txns[1].transactionTime,
      blockchain,
      storage,
    });
  });
});
