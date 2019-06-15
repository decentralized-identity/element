const element = require('../../index');
const fixtures = require('../__tests__/__fixtures__');

const getLocalSidetree = require('./__fixtures__/getLocalSidetree');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('PoisonedOperationAttack');
  await sidetree.createTransactionFromRequests(
    fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
  );

  await sidetree.sleep(1);

  // bad operation ( no keys create! ) / but valid encoding
  const encodedPayload = element.func.encodeJson({
    '@context': 'https://w3id.org/did/v1',
    publicKey: [],
  });
  const signature = element.func.signEncodedPayload(
    encodedPayload,
    fixtures.primaryKeypair.privateKey,
  );
  const requestBody = {
    header: {
      operation: 'create',
      kid: '#primary',
      alg: 'ES256K',
    },
    payload: encodedPayload,
    signature,
  };
  await sidetree.createTransactionFromRequests(requestBody);
});

afterAll(async () => {
  await sidetree.close();
});

describe('Poisoned Operation Attack', () => {
  it('survives small poison', async (done) => {
    let count = 0;
    sidetree.serviceBus.on('element:sidetree:error:badOperation', async ({ operation }) => {
      count++;

      if (count === 1) {
        expect(operation.operationHash).toBe('xcn-0vw4B0M2JKbNXYfsePO3mUnpuGtnLo86MBybbO4');
        done();
      }
    });

    const didDoc = await sidetree.resolve('did:elem:xcn-0vw4B0M2JKbNXYfsePO3mUnpuGtnLo86MBybbO4');
    expect(didDoc).toBe(null);
    await sidetree.sleep(2);
    const op = await sidetree.db.read(
      'element:sidetree:operation:xcn-0vw4B0M2JKbNXYfsePO3mUnpuGtnLo86MBybbO4',
    );
    expect(op.consideredUnresolvableUntil).toBeDefined();
  });
});
