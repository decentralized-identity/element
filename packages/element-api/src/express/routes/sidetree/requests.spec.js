const request = require('supertest');
const element = require('@transmute/element-lib');
const app = require('../../../express/app');
const elementFixtures = require('../../../fixtures/elementFixtures');

let server;
let res;
let actor;

jest.setTimeout(20 * 1000);

beforeAll(async () => {
  server = await request(app);
  [actor] = elementFixtures.generateActors(1);
});

afterAll(async () => {});

describe('sidetree', () => {
  it('requests', async () => {
    const createReq = element.op.create({
      primaryKey: actor.mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: actor.mks.getKeyForPurpose('recovery', 0).publicKey,
    });

    res = await server
      .post('/api/v1/sidetree/requests')
      .send(createReq)
      .set('Accept', 'application/json');
    expect(res.body.ok).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 2 * 1000));
    res = await server.get(`/api/v1/sidetree/${actor.did}`).set('Accept', 'application/json');
    expect(res.body.id).toBe(actor.did);
  });

  it('record', async () => {
    res = await server
      .get(`/api/v1/sidetree/${actor.did}/record`)
      .set('Accept', 'application/json');
    expect(res.body.record.doc.id).toBe(actor.did);
  });

  it('previousOperationHash', async () => {
    res = await server
      .get(`/api/v1/sidetree/${actor.did}/previousOperationHash`)
      .set('Accept', 'application/json');
    expect(res.body.previousOperationHash).toBeDefined();
  });

  it('operations', async () => {
    res = await server.get('/api/v1/sidetree/operations').set('Accept', 'application/json');
    expect(res.body.length).toBeDefined();
  });

  it('docs', async () => {
    res = await server.get('/api/v1/sidetree/docs').set('Accept', 'application/json');
    expect(res.body.length).toBeDefined();
  });
});
