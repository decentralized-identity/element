const element = require('../../index');
const config = require('../json/config.local.json');

const { primaryKeypair, recoveryKeypair } = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let storage;
let blockchain;

describe('syncFromBlockNumber.withPoisonedBatchFiles', () => {
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

  it('create, poison, sync', async () => {
    // CREATE
    const encodedPayload = element.func.encodeJson({
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
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    const requestBody = {
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

    // eslint-disable-next-line
    let txn = await element.func.operationsToTransaction({
      operations: [encodedOperation],
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

    const anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [encodedOperation],
      storage,
    });
    const anchorFile = await storage.read(anchorFileHash);
    // batchFile will not be valid JSON.
    anchorFile.batchFileHash = 'QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43';
    const brokenAnchorFileHash = await storage.write(anchorFile);
    // Insert poison
    await blockchain.write(brokenAnchorFileHash);

    updatedModel = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState,
      reducer: element.reducer,
      storage,
      blockchain,
    });

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
});
