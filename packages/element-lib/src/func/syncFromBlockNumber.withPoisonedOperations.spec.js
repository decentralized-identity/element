const element = require('../../index');
const config = require('../json/config.local.json');

const { primaryKeypair, secondaryKeypair, recoveryKeypair } = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let storage;
let blockchain;

describe('syncFromBlockNumber.withPoisonedOperations', () => {
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

  it('create + poison, sync: DID MUST contain the key used to sign its create operation', async () => {
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
    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    // bad operation / but valid encoding
    encodedPayload = element.func.encodeJson({
      '@context': 'https://w3id.org/did/v1',
      publicKey: [],
    });
    signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    requestBody = {
      header: {
        operation: 'create',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    const encodedOperationBad = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    // eslint-disable-next-line
    let txn = await element.func.operationsToTransaction({
      operations: [encodedOperation, encodedOperationBad],
      storage,
      blockchain,
    });

    const initialState = {};

    const updatedModel = await element.func.syncFromBlockNumber({
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
  });

  it('create + update: Try to update recovery key with primary (pseudo priv escalation)., ', async () => {
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
    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    // UPDATE - Try to replace recovery key with compromised #primary
    encodedPayload = element.func.encodeJson({
      didUniqueSuffix: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      previousOperationHash: 'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      patch: [
        {
          op: 'replace',
          path: '/publicKey/1',
          value: {
            id: '#recovery',
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
    const encodedOperationBad = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });

    // eslint-disable-next-line
    let txn = await element.func.operationsToTransaction({
      operations: [encodedOperation, encodedOperationBad],
      storage,
      blockchain,
    });

    const initialState = {};

    const updatedModel = await element.func.syncFromBlockNumber({
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
  });
});
