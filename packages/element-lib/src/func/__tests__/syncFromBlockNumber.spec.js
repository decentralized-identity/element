const _ = require('lodash');
const element = require('../../../index');
const config = require('../../json/config.local.json');

const {
  aliceKeys,
  createPayloadTemplate,
  updatePayloadTemplate,
} = require('../../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let storage;
let blockchain;

describe('syncFromBlockNumber', () => {
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

    storage = element.storage.ipfs.configure({
      multiaddr: config.ipfsApiMultiAddr,
    });
  });

  it('create and update from signed anchored operations', async () => {
    let uids;
    const createPayload = {
      ...createPayloadTemplate,
    };
    createPayload.publicKey[0].publicKeyHex = aliceKeys.publicKey;

    let txn = await element.func.operationsToTransaction({
      operations: [
        await element.func.payloadToOperation({
          type: 'create',
          kid: '#key1',
          payload: createPayload,
          privateKey: aliceKeys.privateKey,
        }),
      ],
      storage,
      blockchain,
    });

    const initialState = {};

    let updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState,
      reducer: element.reducer,
      storage,
      blockchain,
      onUpdated: (model) => {
        uids = _.without(Object.keys(model), 'transactionTime');

        expect(model[uids[0]].txns[0]).toEqual(txn);
        expect(model[uids[0]].doc.publicKey[0].publicKeyHex).toEqual(
          createPayload.publicKey[0].publicKeyHex,
        );
      },
    });

    const existingDoc = updatedModel[uids[0]].doc;

    txn = await element.func.operationsToTransaction({
      operations: [
        await element.func.payloadToOperation({
          type: 'update',
          kid: '#key1',
          payload: {
            ...updatePayloadTemplate,
            did: existingDoc.id,
            previousOperationHash: updatedModel[uids[0]].previousOperationHash,
            operationNumber: updatedModel[uids[0]].operationNumber + 1,
          },
          privateKey: aliceKeys.privateKey,
        }),
      ],
      storage,
      blockchain,
    });

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
      onUpdated: (model) => {
        expect(model[uids[0]].txns[1]).toEqual(txn);
        expect(model[uids[0]].doc.publicKey[1].id).toEqual('#key2');
      },
    });

    expect.assertions(4);
  });
});
