const _ = require('lodash');
const fixtures = require('./__fixtures__');

const config = require('../json/config.local.json');

const element = require('../../index');

const p = 3;
const actorMap = {};
let actorsArray;
let createOperations;
let updateOperations;

const { generateCreates, generateUpdate1, generateActor } = fixtures;

let storage;
let blockchain;

describe('Integration', () => {
  beforeAll(async () => {
    blockchain = element.blockchain.ethereum.configure({
      hdPath: "m/44'/60'/0'/0/0",
      mnemonic: config.mnemonic,
      providerUrl: config.web3ProviderUrl,
      // when not defined, a new contract is created.
      // anchorContractAddress: config.anchorContractAddress,
    });

    // wait for new contract.
    await blockchain.resolving;

    storage = element.storage.local.configure({
      repo: 'elem-resolve-tests',
    });

    for (let i = 0; i < p; i++) {
      const actor = generateActor();
      actorMap[actor.uid] = actor;
    }
    actorsArray = _.values(actorMap);
    createOperations = await generateCreates(actorMap);
    updateOperations = await generateUpdate1(actorMap);
  });

  it('sync works when operations are in order', async () => {
    await element.func.operationsToTransaction({
      operations: [...createOperations, ...updateOperations],
      storage,
      blockchain,
    });

    const updatedModel = await element.func.syncFromBlockNumber({
      blockNumber: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });

    actorsArray.forEach((actor) => {
      expect(updatedModel[actor.uid].doc.publicKey[0].publicKeyHex).toBe(actor.keypair.publicKey);
      expect(updatedModel[actor.uid].doc.publicKey[1].publicKeyHex).toBe(
        actor.update1Kepair.publicKey,
      );
    });
  });

  it('sync works when operations are NOT in order', async () => {
    // generate a new anchor
    await blockchain.createNewContract();
    await element.func.operationsToTransaction({
      operations: [...updateOperations, ...createOperations].sort(),
      storage,
      blockchain,
    });

    const updatedModel = await element.func.syncFromBlockNumber({
      blockNumber: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });

    actorsArray.forEach((actor) => {
      expect(updatedModel[actor.uid].doc.publicKey[0].publicKeyHex).toBe(actor.keypair.publicKey);
      expect(updatedModel[actor.uid].doc.publicKey[1].publicKeyHex).toBe(
        actor.update1Kepair.publicKey,
      );
    });
  });
});
