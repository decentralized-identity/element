const element = require('../../index');

const config = require('../json/config.local.json');

let primaryKeypair;
let primaryKeypair2;
let secondaryKeypair;
let recoveryKeypair;
let recoveryKeypair2;

let blockchain;
let storage;

let sidetree;
let uid;
let previousOperationHash;

describe.skip('Handles Poisoning', () => {
  beforeAll(async () => {
    // console.log(JSON.stringify(await element.func.createKeys()));
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

    primaryKeypair = {
      publicKey: '0286cdfebc43519c64baf08017b9f14a66871ee907770e6bc8fcd62282ebc72dc0',
      privateKey: '68be85c3ca96c4f67056e57c1a6d9169734b54ab87ed9a853e349461da0e8c0e',
    };
  });

  it('can sync when ledger contains invalid anchorFileHashes', async () => {
    const encodedPayload = element.func.encodeJson({
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#primary',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: primaryKeypair.publicKey,
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

    await element.func.operationsToTransaction({
      operations: [encodedOperation],
      storage,
      blockchain,
    });

    // now insert a bad sidetree transaction...
    // await blockchain.write('QmTJGHccriUtq3qf3bvAQUcDUHnBbHNJG2x2FYwYUecN43');

    sidetree = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });

    // console.log(sidetree);
  });
});
