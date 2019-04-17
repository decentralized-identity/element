const _ = require('lodash');

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

  primaryKeypair2 = {
    publicKey: '028316a20dd69c606df6d5e13013d151d7414814f417c13079bed6cd0ee4d8ca3d',
    privateKey: 'f6ad23e902f6228d1bc4e8d2551fb48b403550e44720dd66b5a2b62ed862163e',
  };

  secondaryKeypair = {
    publicKey: '0353ece606c1be9e28416cdb4a51f78db13efab1b55837c1fa584d4c36b01d10d0',
    privateKey: 'b338c1c9ae9f5649c57fcf79de8daf9e4bcaacdadffa055892baf7d34cd24a24',
  };

  recoveryKeypair = {
    publicKey: '0234835352ed6924be6ad5e2caed0a366c92987ddaed52a76fa91602846ac8fda3',
    privateKey: 'a9ab60d0be5f8c114c374825320bc592fa768674ee815388f92f577d23a7cb4e',
  };

  recoveryKeypair2 = {
    publicKey: '03e4eb42abd2c98a9063a9af13baa6dd1e5fd8e223f164f5d362439a3a6700e268',
    privateKey: '64548c3886186a07bcd2f53914dd88dbc25a5965e1168f3ae431661f8265e45f',
  };
});

describe('create.update.recover.delete', () => {
  it('create', async () => {
    const payload = {
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
    };
    const encodedPayload = element.func.encodeJson(payload);
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'create',
        kid: '#primary',
        alg: 'ES256K',
        proofOfWork: {},
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
    sidetree = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });
    const uids = _.without(_.keys(sidetree), 'transactionTime');
    [uid] = uids;
    expect(uid).toBe('MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(sidetree[uid].doc.publicKey[0].publicKeyHex).toBe(primaryKeypair.publicKey);
    expect(sidetree[uid].doc.publicKey[1].publicKeyHex).toBe(recoveryKeypair.publicKey);
    ({ previousOperationHash } = sidetree[uid]);
  });

  it('update', async () => {
    const payload = {
      did: `did:sidetree:${uid}`,
      operationNumber: 1,
      previousOperationHash,
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
    };
    const encodedPayload = element.func.encodeJson(payload);
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'update',
        kid: '#primary',
        alg: 'ES256K',
        proofOfWork: {},
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

    sidetree = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(sidetree[uid].doc.publicKey[0].publicKeyHex).toBe(primaryKeypair.publicKey);
    expect(sidetree[uid].doc.publicKey[1].publicKeyHex).toBe(recoveryKeypair.publicKey);
    expect(sidetree[uid].doc.publicKey[2].publicKeyHex).toBe(secondaryKeypair.publicKey);
    ({ previousOperationHash } = sidetree[uid]);
  });

  it('recover', async () => {
    const payload = {
      did: `did:sidetree:${uid}`,
      operationNumber: 2,
      previousOperationHash,
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
    };
    const encodedPayload = element.func.encodeJson(payload);
    const signature = element.func.signEncodedPayload(encodedPayload, recoveryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'recover',
        kid: '#recovery',
        alg: 'ES256K',
        proofOfWork: {},
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

    sidetree = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(sidetree[uid].doc.publicKey[0].publicKeyHex).toBe(primaryKeypair2.publicKey);
    expect(sidetree[uid].doc.publicKey[1].publicKeyHex).toBe(recoveryKeypair2.publicKey);
    expect(sidetree[uid].doc.publicKey[2].publicKeyHex).toBe(secondaryKeypair.publicKey);
    ({ previousOperationHash } = sidetree[uid]);
  });

  it('delete', async () => {
    const payload = {
      did: `did:sidetree:${uid}`,
    };
    const encodedPayload = element.func.encodeJson(payload);
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKeypair2.privateKey);
    const requestBody = {
      header: {
        operation: 'delete',
        kid: '#primary',
        alg: 'ES256K',
        proofOfWork: {},
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

    sidetree = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage,
      blockchain,
    });

    expect(sidetree[uid].doc.publicKey).toEqual([]);
  });
});
