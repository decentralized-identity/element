const request = require('supertest');

const app = require('../../../express/app');

const pack = require('../../../../package.json');

let server;

beforeAll(async () => {
  server = await request(app);
});

afterAll(async () => {
  await app.get('sidetree').close();
});

describe('version', () => {
  describe('GET /version', () => {
    it('should return the commit and package version', async () => {
      const res = await server.get('/api/v1/version');
      expect(res.body.commit).toBeDefined();
      expect(res.body.version).toBeDefined(pack.verison);
    });
  });
});
