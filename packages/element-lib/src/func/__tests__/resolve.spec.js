const _ = require('lodash');
const element = require('../../../index');

const { generateActor, generateUpdate1, generateCreates } = require('../../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

const actorMap = {};
let actorsArray = [];
let createOperations = [];
let updateOperations = [];
const count = 3;

const { storage, ledger } = element;

describe('resolve', () => {
  beforeAll(async () => {
    process.env.ELEMENT_MNEUMONIC = 'hazard pride garment scout search divide solution argue wait avoid title cave';
    process.env.ELEMENT_PROVIDER = 'http://localhost:8545';
    process.env.ELEMENT_IPFS_MULTIADDR = '/ip4/127.0.0.1/tcp/5001';

    for (let i = 0; i < count; i++) {
      const actor = generateActor();
      actorMap[actor.uid] = actor;
    }
    actorsArray = _.values(actorMap);
    createOperations = await generateCreates(actorMap);
    updateOperations = await generateUpdate1(actorMap);

    await element.func.operationsToTransaction({
      operations: [...createOperations, ...updateOperations],
      storage: element.storage,
      ledger: element.ledger,
    });
  });

  // this is not very fast or efficient... better to trust a cache.
  it('can resolve a did', async () => {
    const did = `did:elem:${actorsArray[0].uid}`;
    const doc = await element.func.resolve(did);
    expect(doc.id).toBe(did);
  });

  it('can resolve faster after cache hit ', async () => {
    const did = `did:elem:${actorsArray[0].uid}`;
    const doc = await element.func.resolve(did);
    expect(doc.id).toBe(did);
  });

  it('returns null when did dne', async () => {
    const did = 'did:elem:dne';
    const doc = await element.func.resolve(did);
    expect(doc).toBe(null);
  });
});
