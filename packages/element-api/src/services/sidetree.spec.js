const element = require('@transmute/element-lib');
const sidetree = require('./sidetree');

jest.setTimeout(20 * 1000);

beforeAll(async () => {});

afterAll(async () => {
  await sidetree.close();
});

const actor = { name: 'alice' };
actor.mks = new element.MnemonicKeySystem(
  'category copy escape scan type news bird awake affair base mansion favorite',
);

actor.didUniqueSuffix = element.op.getDidUniqueSuffix({
  primaryKey: actor.mks.getKeyForPurpose('primary', 0),
  recoveryPublicKey: actor.mks.getKeyForPurpose('recovery', 0).publicKey,
});

describe('sidetree', () => {
  it('service is testable', async () => {
    await sidetree.sleep(1);
  });

  it('can create a did', async () => {
    const txn = await sidetree.createTransactionFromRequests([
      sidetree.op.create({
        primaryKey: actor.mks.getKeyForPurpose('primary', 0),
        recoveryPublicKey: actor.mks.getKeyForPurpose('recovery', 0).publicKey,
      }),
    ]);
    expect(txn.anchorFileHash).toBeDefined();
  });

  it('can resolve', async () => {
    const didDoc = await sidetree.resolve(`did:elem:${actor.didUniqueSuffix}`);
    expect(didDoc.id).toBe(`did:elem:${actor.didUniqueSuffix}`);
  });

  it('can resolve even after network change', async () => {
    // this is a valid ropsten DID, this tests confirms that the cache is reslient
    const didDoc = await sidetree.resolve('did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY');
    expect(didDoc).toBe(null);
  });
});
