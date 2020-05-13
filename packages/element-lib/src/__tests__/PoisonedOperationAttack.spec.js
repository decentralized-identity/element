jest.setTimeout(10 * 1000);

const {
  didMethodName,
  getTestSideTree,
  generateActors,
  getActorByIndex,
} = require('./test-utils');

let sidetree;
let actor;

beforeAll(async () => {
  sidetree = getTestSideTree();
  sidetree.parameters.mapSync = false;
  await generateActors(sidetree, 1);
  actor = await getActorByIndex(0);
  await sidetree.batchScheduler.writeNow(actor.createPayload);
});

describe('Poisoned Operation Attack', () => {
  it('should survives small poison', async () => {
    // bad operation ( no keys create! ) / but valid encoding
    const encodedPayload = sidetree.func.encodeJson({
      '@context': 'https://w3id.org/did/v1',
      publicKey: [],
    });
    const encodedHeader = sidetree.func.encodeJson({
      operation: 'create',
      kid: '#primary',
      alg: 'ES256K',
    });
    const signature = sidetree.func.signEncodedPayload(
      encodedHeader,
      encodedPayload,
      actor.primaryKey.privateKey
    );
    const requestBody = {
      protected: encodedHeader,
      payload: encodedPayload,
      signature,
    };
    const poisonedTransaction = await sidetree.batchScheduler.writeNow(
      requestBody
    );
    const anchorFile = await sidetree.storage.read(
      poisonedTransaction.anchorFileHash
    );
    const didDoc = await sidetree.resolve(actor.didUniqueSuffix, true);
    expect(didDoc.id).toBe(`${didMethodName}:${actor.didUniqueSuffix}`);
    const badDidDoc = await sidetree.resolve(
      anchorFile.didUniqueSuffixes[0],
      true
    );
    expect(badDidDoc).not.toBeDefined();
  });
});
