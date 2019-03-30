// eslint-disable-next-line
const request = require('supertest');

const app = require('../../../../express/app');

const pack = require('../../../../../package.json');

describe('version', () => {
  describe('GET /version', () => {
    it('should return the commit and package version', async () => {
      const { body } = await request(app).get('/api/v1/version');
      expect(body.commit).toBeDefined();
      expect(body.version).toBeDefined(pack.verison);
    });
  });
});
