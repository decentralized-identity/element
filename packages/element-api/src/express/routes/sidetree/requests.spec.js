const request = require('supertest');
const app = require('../../../express/app');
const {
  generateActors,
  getTestSidetree,
} = require('../../../fixtures/elementFixtures');

const sidetree = getTestSidetree();

let server;
let res;
let actor;

jest.setTimeout(20 * 1000);

beforeAll(() => {
  server = request(app);
  [actor] = generateActors(sidetree, 1);
});

afterAll(async () => {});

describe('sidetree', () => {
  it('requests', async () => {
    const primaryKey = actor.mks.getKeyForPurpose('primary', 0);
    const recoveryKey = actor.mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    const createPayload = sidetree.op.getCreatePayload(
      didDocumentModel,
      primaryKey
    );

    res = await server
      .post('/api/v1/sidetree/requests')
      .send(createPayload)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    await new Promise(resolve => setTimeout(resolve, 2 * 1000));
    res = await server.get(`/api/v1/sidetree/${actor.did}`);
    expect(res.body.id).toBe(actor.did);
  });

  it('docs', async () => {
    res = await server
      .get('/api/v1/sidetree/docs')
      .set('Accept', 'application/json');
    expect(res.body.length).toBeDefined();
  });
});
