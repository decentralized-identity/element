const request = require('supertest');

const app = require('../../../express/app');

let server;
let res;

beforeAll(async () => {
  server = await request(app);
});

afterAll(async () => {
  await app.get('sidetree').close();
});

describe('nodeInfo', () => {
  it('should return a public json config', async () => {
    res = await server.get('/api/v1/sidetree/node').set('Accept', 'application/json');
    expect(res.body.ipfs).toBeDefined();
    expect(res.body.ethereum).toBeDefined();
    expect(res.body.sidetree).toBeDefined();
  });
});
