const element = require('../../index');
const config = require('../json/config.local.json');

const {
  primaryKeypair,
  primaryKeypair2,
  secondaryKeypair,
  recoveryKeypair,
  recoveryKeypair2,
} = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let storage;
let blockchain;

describe('syncFromBlockNumber.withNoCache', () => {
  beforeEach(async () => {
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

  it('no cache: create, sync, update, sync, recover, sync, delete, sync', async () => {
    // CREATE
    let encodedPayload = element.func.encodeJson({
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#primary',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: primaryKeypair.publicKey,
        },
        {
          id: '#recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: recoveryKeypair.publicKey,
        },
      ],
    });
    let signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    let requestBody = {
      header: {
        operation: 'create',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    let encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    // eslint-disable-next-line
    let txn = await element.func.operationsToTransaction({
      operations: [encodedOperation],
      storage,
      blockchain,
    });

    let initialState = {};

    let updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState,
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.id).toBe(
      'did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
    );
    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[0].publicKeyHex,
    ).toBe(primaryKeypair.publicKey);
    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[1].publicKeyHex,
    ).toBe(recoveryKeypair.publicKey);

    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[2],
    ).toBeUndefined();

    // UPDATE
    encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      previousOperationHash: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      patch: [
        {
          op: 'replace',
          path: '/publicKey/2',
          value: {
            id: '#secondary',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: secondaryKeypair.publicKey,
          },
        },
      ],
    });
    signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    requestBody = {
      header: {
        operation: 'update',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    txn = await element.func.operationsToTransaction({
      operations: [encodedOperation],
      storage,
      blockchain,
    });

    initialState = {};

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState,
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[2].publicKeyHex,
    ).toBe(secondaryKeypair.publicKey);

    // RECOVER
    encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      previousOperationHash: 'N2K69iH3ZvrjOZjaMAx8rhtPB8yyM1DgjQPg6_B6bBQ',
      patch: [
        // first op should update recovery key.
        {
          op: 'replace',
          path: '/publicKey/1',
          value: {
            id: '#recovery',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: recoveryKeypair2.publicKey,
          },
        },
        {
          op: 'replace',
          path: '/publicKey/0',
          value: {
            id: '#primary',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: primaryKeypair2.publicKey,
          },
        },
      ],
    });
    signature = element.func.signEncodedPayload(encodedPayload, recoveryKeypair.privateKey);
    requestBody = {
      header: {
        operation: 'recover',
        kid: '#recovery',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    txn = await element.func.operationsToTransaction({
      operations: [encodedOperation],
      storage,
      blockchain,
    });

    initialState = {};

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState,
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[0].publicKeyHex,
    ).toBe(primaryKeypair2.publicKey);
    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[1].publicKeyHex,
    ).toBe(recoveryKeypair2.publicKey);

    // DELETE
    encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
    });
    signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair2.privateKey);
    requestBody = {
      header: {
        operation: 'delete',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    txn = await element.func.operationsToTransaction({
      operations: [encodedOperation],
      storage,
      blockchain,
    });

    initialState = {};

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState,
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey.length).toBe(
      0,
    );
    expect(updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].deleted).toBe(true);
  });
});
