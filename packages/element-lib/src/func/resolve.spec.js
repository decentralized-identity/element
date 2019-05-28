const _ = require('lodash');
const element = require('../../index');
const config = require('../json/config.local.json');

const { generateActor, generateUpdate1, generateCreates } = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

const actorMap = {};

const count = 3;

let blockchain;
let storage;

describe('element.func.resolve', () => {
  it('throws when called without sufficient args', async () => {
    expect.assertions(1);
    const did = 'did:elem:...';
    try {
      const doc = await element.func.resolve(did);
      expect(doc.id).toBe(did);
    } catch (e) {
      expect(e.message).toBe('Invalid args: resolve({ did, reducer, storage, blockchain, transactionTime})');
    }
  });

  describe('resolve', () => {
    beforeAll(async () => {
      for (let i = 0; i < count; i++) {
        const actor = generateActor();
        actorMap[actor.uid] = actor;
      }
      const createOperations = await generateCreates(actorMap);
      const updateOperations = await generateUpdate1(actorMap);

      blockchain = element.blockchain.ethereum.configure({
        hdPath: "m/44'/60'/0'/0/0",
        mnemonic: config.mnemonic,
        providerUrl: config.web3ProviderUrl,
        // when not defined, a new contract is created.
        // anchorContractAddress: config.anchorContractAddress,
      });

      // wait for new contract.
      await blockchain.resolving;

      storage = element.storage.ipfs.configure({
        multiaddr: config.ipfsApiMultiAddr,
      });

      await element.func.operationsToTransaction({
        operations: [...createOperations, ...updateOperations],
        storage,
        blockchain,
      });
    });

    it('can resolve a did with path and fragment', async () => {
      const did = `did:elem:${_.values(actorMap)[0].uid}/some/path#fragment=123`;
      const doc = await element.func.resolve({
        did,
        transactionTime: 0,
        reducer: element.reducer,
        storage,
        blockchain,
      });
      expect(doc.id).toBe(did.split('/')[0]);
    });

    it('can resolve faster after cache hit', async () => {
      const did = `did:elem:${_.values(actorMap)[1].uid}`;
      const doc = await element.func.resolve({
        did,
        transactionTime: 0,
        reducer: element.reducer,
        storage,
        blockchain,
      });
      expect(doc.id).toBe(did.split('/')[0]);
    });

    it('returns null when did dne', async () => {
      const did = 'did:elem:dne';
      const doc = await element.func.resolve({
        did,
        transactionTime: 0,
        reducer: element.reducer,
        storage,
        blockchain,
      });
      expect(doc).toBe(null);
    });
  });
});
