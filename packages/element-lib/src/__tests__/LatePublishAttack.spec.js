const MerkleTools = require('merkle-tools');

jest.setTimeout(20 * 1000);

const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
  getActorByIndex,
  generateActors,
  updateByActorIndex,
} = require('./test-utils');

let sidetree;
let batchFile;
let batchFileHash;
let anchorFile;
let anchorFileHash;
let actor;
let newKey;

afterAll(async () => {
  await sidetree.close();
});

// Why Sidetree DIDs are non transferable.
// we need randomness here, because obviously IPFS will have the published
// data after one test run.
describe('LatePublishAttack', () => {
  beforeAll(async () => {
    sidetree = await getTestSideTree();
    sidetree.parameters.mapSync = false;
    await generateActors(sidetree, 1);
    actor = await getActorByIndex(0);
  });

  it('create a did', async () => {
    const txn = await sidetree.batchScheduler.writeNow(actor.createPayload);
    expect(txn.transactionHash).toBeDefined();
    await sidetree.resolve(actor.didUniqueSuffix, true);
    const type = 'did:documentRecord';
    const [docRecord] = await sidetree.db.readCollection(type);
    expect(docRecord.type).toBe(type);
    expect(docRecord.record).toBeDefined();
    expect(docRecord.record.lastTransaction).toBeDefined();
  });

  it('create attack payload', async () => {
    const updatePayload = await updateByActorIndex(sidetree, 0);
    const decodedOperations = [updatePayload];
    const operations = decodedOperations.map(sidetree.func.encodeJson);

    // Write batchFile to storage
    batchFile = {
      operations,
    };

    // Instead of writing the batchFile to IPFS, we only compute its hash
    batchFileHash = await sidetree.func.objectToMultihash(batchFile);

    // Write anchorFile to storage
    const didUniqueSuffixes = decodedOperations.map(
      sidetree.func.getDidUniqueSuffix
    );
    const merkleTools = new MerkleTools({
      hashType: 'sha256', // optional, defaults to 'sha256'
    });
    merkleTools.addLeaves(operations, true);
    merkleTools.makeTree(false);
    const root = merkleTools.getMerkleRoot();
    merkleTools.resetTree();
    anchorFile = {
      batchFileHash,
      didUniqueSuffixes,
      merkleRoot: root.toString('hex'),
    };
    // Instead of writing the anchorFile to IPFS, we only compute its hash
    anchorFileHash = await sidetree.func.objectToMultihash(anchorFile);
    // Anchor on ethereum
    const txn = await sidetree.blockchain.write(anchorFileHash);
    expect(txn).toBeDefined();
  });

  it('pretend to transfer', async () => {
    const lastOperation = await getLastOperation(
      sidetree,
      actor.didUniqueSuffix
    );
    newKey = await actor.mks.getKeyForPurpose('primary', 2);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'add-public-keys',
          publicKeys: [
            {
              id: `${didMethodName}:${actor.didUniqueSuffix}#newKey`,
              usage: 'signing',
              type: 'Secp256k1VerificationKey2018',
              publicKeyHex: newKey.publicKey,
            },
          ],
        },
        {
          action: 'remove-public-keys',
          publicKeys: [`${didMethodName}:${actor.didUniqueSuffix}#primary`],
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${actor.didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const operation = sidetree.op.makeSignedOperation(
      header,
      payload,
      actor.primaryKey.privateKey
    );
    const txn = await sidetree.batchScheduler.writeNow(operation);
    expect(txn.transactionHash).toBeDefined();
  });

  it('observers think the transfer occured', async () => {
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.publicKey[1].publicKeyHex).toBe(newKey.publicKey);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(actor.recoveryKey.publicKey);
  });

  it('observers can see the transfer never occured.', async () => {
    // Now we publish our sneeky trick.
    await sidetree.storage.write(batchFile);
    await sidetree.storage.write(anchorFile);

    await sidetree.db.deleteDB();
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.publicKey[0].publicKeyHex).toBe(actor.primaryKey.publicKey);
    expect(didDoc.publicKey[1].publicKeyHex).toBe(actor.recoveryKey.publicKey);
    expect(didDoc.publicKey[2].id).toBe(`${didDoc.id}#newKey`);
  });
});
