const request = require('supertest');
const faker = require('faker');
const element = require('@transmute/element-lib');
const app = require('../../../../express/app');

let server;
let res;
let body;
let didUniqueSuffix;

jest.setTimeout(10 * 1000);

beforeAll(async () => {
  server = await request(app);
});

afterAll(async () => {});

describe('sidetree', () => {
  it('node', async () => {
    res = await server.get('/api/v1/sidetree/node').set('Accept', 'application/json');
    body = await res.body;
    expect(body.ipfs).toBeDefined();
    expect(body.ethereum).toBeDefined();
    expect(body.sidetree).toBeDefined();
  });

  it('create', async () => {
    // be careful not to start batching or you will get 2 transcations.
    // await getSidetree();
    const i = 0;
    const mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic());
    didUniqueSuffix = element.op.getDidUniqueSuffix({
      primaryKey: mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: mks.getKeyForPurpose('recovery', 0).publicKey,
    });
    const actor = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: faker.name.findName(),
      email: faker.internet.email(),
      jobTitle: faker.name.jobTitle(),
      sameAs: [
        `https://www.facebook.com/${i}`,
        `https://www.linkedin.com/${i}`,
        `https://did.example.com/did:elem:${didUniqueSuffix}`,
      ],
      mks,
      didUniqueSuffix,
    };

    const createReq = element.op.create({
      primaryKey: actor.mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: actor.mks.getKeyForPurpose('recovery', 0).publicKey,
    });

    res = await server
      .post('/api/v1/sidetree/requests')
      .send(createReq)
      .set('Accept', 'application/json');

    body = await res.body;
    expect(body.ok).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 5 * 1000));
  });

  it('resolver', async () => {
    res = await server
      .get(`/api/v1/sidetree/did:elem:${didUniqueSuffix}`)
      .set('Accept', 'application/json');
    body = await res.body;
    expect(body.id).toBe(`did:elem:${didUniqueSuffix}`);
  });

  it('record', async () => {
    res = await server
      .get(`/api/v1/sidetree/did:elem:${didUniqueSuffix}/record`)
      .set('Accept', 'application/json');
    body = await res.body;
    expect(body.record.doc.id).toBe(`did:elem:${didUniqueSuffix}`);
  });

  it('previousOperationHash', async () => {
    res = await server
      .get(`/api/v1/sidetree/did:elem:${didUniqueSuffix}/previousOperationHash`)
      .set('Accept', 'application/json');
    body = await res.body;
    expect(body.previousOperationHash).toBeDefined();
  });

  it('operations', async () => {
    res = await server.get('/api/v1/sidetree/operations').set('Accept', 'application/json');
    body = await res.body;
    expect(body.length).toBeDefined();
  });

  it('docs', async () => {
    res = await server.get('/api/v1/sidetree/docs').set('Accept', 'application/json');
    body = await res.body;
    expect(body.length).toBeDefined();
  });
});
