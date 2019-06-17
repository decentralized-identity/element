const request = require('supertest');
const faker = require('faker');
const element = require('@transmute/element-lib');
const app = require('../../../../express/app');

const { sidetree, getSidetree } = require('../../../../services/sidetree');

let server;
let res;
let body;

// 2 minute timeout for end to end testnet
jest.setTimeout(2 * 60 * 1000);

beforeAll(async () => {
  server = await request(app);
});

afterAll(async () => {});

describe('sidetree', () => {

  it.only('operations', async ()=>{
    res = await server.get('/api/v1/sidetree/operations').set('Accept', 'application/json');
    body = await res.body;
    expect(body.length).toBeDefined();
  })

  it('node', async () => {
    res = await server.get('/api/v1/sidetree/node').set('Accept', 'application/json');
    body = await res.body;
    expect(body.ipfs).toBeDefined();
    expect(body.ethereum).toBeDefined();
    expect(body.sidetree).toBeDefined();
  });

  it('resolver', async () => {
    res = await server
      .get('/api/v1/sidetree/did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY')
      .set('Accept', 'application/json');
    body = await res.body;
    expect(body.id).toBe('did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY');
  });

  it('record', async () => {
    res = await server
      .get('/api/v1/sidetree/did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY/record')
      .set('Accept', 'application/json');
    body = await res.body;
    expect(body.record.doc.id).toBe('did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY');
  });

  it('previousOperationHash', async () => {
    res = await server
      .get(
        '/api/v1/sidetree/did:elem:2p-Etm96nYATm0CP4qZQEyIHhUj5hDDDSwbQhTbNstY/previousOperationHash',
      )
      .set('Accept', 'application/json');
    body = await res.body;
    expect(body.previousOperationHash).toBeDefined();
  });

  it('docs', async () => {
    res = await server.get('/api/v1/sidetree/docs').set('Accept', 'application/json');
    body = await res.body;
    expect(body.length).toBeDefined();
  });

  it('create', async () => {
    // be careful not to start batching or you will get 2 transcations.
    // await getSidetree();
    const i = 0;
    const mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic());
    const didUniqueSuffix = sidetree.op.getDidUniqueSuffix({
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

    const createReq = sidetree.op.create({
      primaryKey: actor.mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: actor.mks.getKeyForPurpose('recovery', 0).publicKey,
    });

    res = await server
      .post('/api/v1/sidetree/requests')
      .send(createReq)
      .set('Accept', 'application/json');

    body = await res.body;
    expect(body.ok).toBe(true);
    await sidetree.sleep(1.5 * 60); // 1.5 minutes
    const didDoc = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
    expect(didDoc.id).toBe(`did:elem:${didUniqueSuffix}`);
  });
});
