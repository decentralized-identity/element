const _ = require('lodash');
const fixtures = require('./__fixtures__');

const element = require('../../index');

const p = 3;
const actorMap = {};
let actorsArray;
let createOperations;
let updateOperations;

const { generateCreates, generateUpdate1, generateActor } = fixtures;

describe('Integration', () => {
  beforeAll(async () => {
    process.env.ELEMENT_MNEUMONIC = 'hazard pride garment scout search divide solution argue wait avoid title cave';
    process.env.ELEMENT_PROVIDER = 'http://localhost:8545';
    process.env.ELEMENT_IPFS_MULTIADDR = '/ip4/127.0.0.1/tcp/5001';

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
      storage: element.storage,
      ledger: element.ledger,
    });

    const updatedModel = await element.func.syncFromBlockNumber({
      blockNumber: 0,
      initialState: {},
      reducer: element.reducer,
      storage: element.storage,
      ledger: element.ledger,
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
    await element.ledger.createNewContract();
    await element.func.operationsToTransaction({
      operations: [...updateOperations, ...createOperations].sort(),
      storage: element.storage,
      ledger: element.ledger,
    });

    const updatedModel = await element.func.syncFromBlockNumber({
      blockNumber: 0,
      initialState: {},
      reducer: element.reducer,
      storage: element.storage,
      ledger: element.ledger,
    });

    actorsArray.forEach((actor) => {
      expect(updatedModel[actor.uid].doc.publicKey[0].publicKeyHex).toBe(actor.keypair.publicKey);
      expect(updatedModel[actor.uid].doc.publicKey[1].publicKeyHex).toBe(
        actor.update1Kepair.publicKey,
      );
    });
  });
});
