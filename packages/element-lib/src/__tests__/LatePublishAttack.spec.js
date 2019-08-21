const element = require('../../index');
const {
  primaryKeypair,
  primaryKeypair2,
  secondaryKeypair,
  recoveryKeypair,
  recoveryKeypair2,
} = require('./__fixtures__');
const getLocalSidetree = require('./__fixtures__/getLocalSidetree');
const fixtureStorage = require('./__fixtures__').storage;

jest.setTimeout(20 * 1000);

const sleep = seconds => new Promise(r => setTimeout(r, seconds * 1000));

let sidetree;
let didUniqueSuffix;
let anchorFileHash;

const didDocument = {
  '@context': 'https://w3id.org/did/v0.11',
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
  service: [
    {
      id: '#transmute.element.test',
      type: 'Transmute.Element.Test',
      serviceEndpoint: `http://vanity.example.com#${Math.random()}`,
    },
  ],
};

// Why Sidetree DIDs are non transferable.
// we need randomness here, because obviously IPFS will have the published
// data after one test run.
describe('LatePublishAttack', () => {
  beforeAll(async () => {
    sidetree = await getLocalSidetree('LatePublishAttack');
    await sidetree.db.deleteDB();
  });

  it('create a did', async () => {
    const encodedPayload = element.func.encodeJson(didDocument);
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
    const txn = await sidetree.createTransactionFromRequests(requestBody);
    expect(txn.transactionTime).toBeDefined();
    await sidetree.sync({
      fromTransactionTime: 0,
      toTransactionTime: txn.transactionTime,
    });
    const type = 'element:sidetree:did:documentRecord';
    const [docRecord] = await sidetree.db.readCollection(type);
    expect(docRecord.type).toBe(type);
    expect(docRecord.record).toBeDefined();
    expect(docRecord.record.previousOperationHash).toBeDefined();
    expect(docRecord.record.lastTransaction).toBeDefined();
    expect(docRecord.record.doc).toEqual({
      ...didDocument,
      id: docRecord.record.doc.id,
    });
    didUniqueSuffix = docRecord.record.previousOperationHash;
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
    const txn = await sidetree.createTransactionFromRequests(requestBody);
    expect(txn.transactionTime).toBeDefined();
  });

  it('observers think the transfer occured', async () => {
    await sidetree.db.deleteDB();
    await sleep(3);
    const didDoc = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(primaryKeypair2.publicKey);
    expect(didDoc.publicKey[1].publicKeyHex).toBe(recoveryKeypair2.publicKey);
  });

  it('publish attack payload', async () => {
    // Now we publish our sneeky trick.
    const ourLateAnchorFile = await fixtureStorage.read(anchorFileHash);
    const ourLateBatchFile = await fixtureStorage.read(ourLateAnchorFile.batchFileHash);
    await sidetree.storage.write(ourLateAnchorFile);
    await sidetree.storage.write(ourLateBatchFile);
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
