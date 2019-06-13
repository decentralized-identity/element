const _ = require('lodash');
const element = require('../../index');

const {
  primaryKeypair,
  primaryKeypair2,
  secondaryKeypair,
  recoveryKeypair,
  recoveryKeypair2,
  // eslint-disable-next-line
} = require('./__fixtures__');

jest.setTimeout(10 * 1000);
const sleep = seconds => new Promise(r => setTimeout(r, seconds * 1000));

const getLocalSidetree = require('./__fixtures__/getLocalSidetree');
const fixtureStorage = require('./__fixtures__').storage;

let sidetree;
let tree;
let service;
let didUniqueSuffix;
let anchorFileHash;

// Why Sidetree DIDs are non transferable.
// we need randomness here, because obviously IPFS will have the published
// data after one test run.
describe('LatePublishAttack', () => {
  beforeAll(async () => {
    sidetree = await getLocalSidetree('LatePublishAttack');
    await sidetree.db.deleteDB();
    service = [
      {
        id: '#transmute.element.test',
        type: 'Transmute.Element.Test',
        serviceEndpoint: `http://vanity.example.com#${Math.random()}`,
      },
    ];
  });

  it('create a did', async () => {
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
      service,
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

    const txn = await sidetree.saveOperationFromRequestBody(requestBody);
    expect(txn.transactionTime).toBeDefined();
    tree = await sidetree.resolve();
    [didUniqueSuffix] = _.without(Object.keys(tree), 'transactionTime');
  });

  it('create attack payload', async () => {
    const encodedPayload = element.func.encodeJson({
      didUniqueSuffix,
      previousOperationHash: didUniqueSuffix, // should see this twice.
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
    const signature = element.func.signEncodedPayload(encodedPayload, recoveryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'recover',
        kid: '#recovery',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };

    const encodedOperation = element.func.requestBodyToEncodedOperation({
      ...requestBody,
    });
    anchorFileHash = await element.func.operationsToAnchorFile({
      operations: [encodedOperation],
      storage: fixtureStorage, // this should be fixture storage
    });
    await sidetree.blockchain.write(anchorFileHash);
  });

  it('pretend to transfer', async () => {
    const encodedPayload = element.func.encodeJson({
      didUniqueSuffix,
      previousOperationHash: didUniqueSuffix, // should see this twice.
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
    const signature = element.func.signEncodedPayload(encodedPayload, recoveryKeypair.privateKey);
    const requestBody = {
      header: {
        operation: 'recover',
        kid: '#recovery',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
    const txn = await sidetree.saveOperationFromRequestBody(requestBody);
    expect(txn.transactionTime).toBeDefined();
  });

  it('observers think the transfer occured', async () => {
    tree = await sidetree.resolve();
    expect(tree[didUniqueSuffix].doc.publicKey[0].publicKeyHex).toBe(primaryKeypair2.publicKey);
    expect(tree[didUniqueSuffix].doc.publicKey[1].publicKeyHex).toBe(recoveryKeypair2.publicKey);
  });

  it('publish attack payload', async () => {
    // Now we publish our sneeky trick.
    const ourLateAnchorFile = await fixtureStorage.read(anchorFileHash);
    const ourLateBatchFile = await fixtureStorage.read(ourLateAnchorFile.batchFileHash);
    sidetree.storage.write(ourLateAnchorFile);
    sidetree.storage.write(ourLateBatchFile);
  });

  it('observers can see the transfer never occured.', async () => {
    // we need to delete the database,
    // because the cache logic has already determined the attack hash not resolvable.
    await sidetree.db.deleteDB();
    await sleep(3);
    const didDoc = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(primaryKeypair2.publicKey);
    expect(didDoc.publicKey[1].publicKeyHex).toBe(secondaryKeypair.publicKey);
  });
});
