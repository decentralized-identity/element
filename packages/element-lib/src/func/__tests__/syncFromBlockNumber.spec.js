const _ = require('lodash');
const element = require('../../../index');

const {
  aliceKeys,
  createPayloadTemplate,
  updatePayloadTemplate,
} = require('../../__tests__/__fixtures__');

const { storage, ledger } = element;

jest.setTimeout(10 * 1000);

describe('syncFromBlockNumber', () => {
  beforeAll(() => {
    process.env.ELEMENT_MNEUMONIC = 'hazard pride garment scout search divide solution argue wait avoid title cave';
    process.env.ELEMENT_PROVIDER = 'http://localhost:8545';
    process.env.ELEMENT_IPFS_MULTIADDR = '/ip4/127.0.0.1/tcp/5001';
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
      ledger,
    });

    const initialState = {};

    let updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState,
      reducer: element.reducer,
      storage,
      ledger,
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
      ledger: element.ledger,
    });

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      ledger,
      onUpdated: (model) => {
        expect(model[uids[0]].txns[1]).toEqual(txn);
        expect(model[uids[0]].doc.publicKey[1].id).toEqual('#key2');
      },
    });

    expect.assertions(4);
  });
});
