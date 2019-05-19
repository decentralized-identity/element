const element = require('../../index');
const config = require('../json/config.local.json');

const {
  primaryKeypair,
  primaryKeypair2,
  secondaryKeypair,
  recoveryKeypair,
  recoveryKeypair2,
  // eslint-disable-next-line
} = require('../__tests__/__fixtures__');

jest.setTimeout(20 * 1000);

const fixtureStorage = require('../__tests__/__fixtures__').storage;

let storage;
let blockchain;

// Why Sidetree DIDs are non transferable.
describe('syncFromBlockNumber.withLatePublish', () => {
  console.info('This test should log warnings.');
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

  it('create, revoke (no publish), revoke (publish), sync, publish, sync', async () => {
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

    // Out sneeky trick.
    // RECOVER
    encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      previousOperationHash: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI', // should see this twice.
      patch: [
        // first op should update recovery key.
        {
          op: 'replace',
          path: '/publicKey/1',
          value: {
            id: '#recovery',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: secondaryKeypair.publicKey,
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
    const anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [encodedOperation],
      storage: fixtureStorage, // this should be fixture storage
    });
    await blockchain.write(anchorFileHash);

    let updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
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

    // now we pretend to transfer...
    // RECOVER
    encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      previousOperationHash: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI', // should see this twice.
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

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: updatedModel.transactionTime + 1,
      initialState: updatedModel,
      reducer: element.reducer,
      storage,
      blockchain,
    });

    // Ledger observers think we transfered!
    // (because some anchorFiles timeout and are ignored.)

    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[0].publicKeyHex,
    ).toBe(primaryKeypair2.publicKey);
    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[1].publicKeyHex,
    ).toBe(recoveryKeypair2.publicKey);

    // Now we publish our sneeky trick.
    const ourLateAnchorFile = await fixtureStorage.read(anchorFileHash);
    const ourLateBatchFile = await fixtureStorage.read(ourLateAnchorFile.batchFileHash);
    storage.write(ourLateAnchorFile);
    storage.write(ourLateBatchFile);

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[0].publicKeyHex,
    ).toBe(primaryKeypair2.publicKey);
    expect(
      updatedModel['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[1].publicKeyHex,
    ).toBe(secondaryKeypair.publicKey);
    // Looks like we never actually transfered recovery power (control)....
  });
});
