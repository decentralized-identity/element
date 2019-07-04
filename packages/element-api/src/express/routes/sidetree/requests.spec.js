const request = require('supertest');
const element = require('@transmute/element-lib');
const app = require('../../../express/app');
const elementFixtures = require('../../../fixtures/elementFixtures');

let server;
let res;
let actor;

jest.setTimeout(10 * 1000);

beforeAll(async () => {
  server = await request(app);
  [actor] = elementFixtures.generateActors(1);
});

afterAll(async () => {});

describe('requests', () => {
  it('create', async () => {
    const createReq = element.op.create({
      primaryKey: actor.mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: actor.mks.getKeyForPurpose('recovery', 0).publicKey,
    });
    res = await server
      .post('/api/v1/sidetree/requests')
      .send(createReq)
      .set('Accept', 'application/json');

    expect(res.body.ok).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 5 * 1000));
    res = await server.get(`/api/v1/sidetree/${actor.did}`).set('Accept', 'application/json');
    console.log(res.body);
    expect(res.body.id).toBe(actor.did);
  });
});
