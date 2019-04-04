// eslint-disable-next-line
const request = require('supertest');

const app = require('../../../../express/app');

const batchService = require('../../../../lib/batchService');

const fixtures = require('./__fixtures__');

jest.setTimeout(5 * 1000);

const sleep = seconds => new Promise((resolve) => {
  setTimeout(resolve, seconds * 1000);
});

let server;

beforeAll(async () => {
  server = await request(app);
});

afterAll(async () => {
  await batchService.teardown();
  await sleep(1);
});

describe('sidetree.batching', () => {
  let reqs = [];
  it('generator works', async () => {
    reqs = [];
    // eslint-disable-next-line
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line
      reqs.push(await fixtures.createGenerator());
    }

    expect(reqs.length).toBe(10);
  });

  it('node info has sidetree batch config', async () => {
    const { body } = await server.get('/api/v1/sidetree/node').set('Accept', 'application/json');
    expect(body.sidetree.max_batch_size).toBe('10');
    expect(body.sidetree.batch_interval_in_seconds).toBe('1');
  });

  it('can see current batch', async () => {
    let { body } = await server.get('/api/v1/sidetree/batch').set('Accept', 'application/json');
    expect(body).toEqual({
      operations: [],
    });

    ({ body } = await server
      .post('/api/v1/sidetree')
      .send(reqs[0])
      .set('Accept', 'application/json'));

    ({ body } = await server.get('/api/v1/sidetree/batch').set('Accept', 'application/json'));

    expect(body.operations.length).toBe(1);

    ({ body } = await server
      .post('/api/v1/sidetree')
      .send(reqs[1])
      .set('Accept', 'application/json'));

    ({ body } = await server.get('/api/v1/sidetree/batch').set('Accept', 'application/json'));

    expect(body.operations.length).toBe(2);

    await sleep(3);

    ({ body } = await server.get('/api/v1/sidetree/batch').set('Accept', 'application/json'));

    expect(body.operations.length).toBe(0);

    ({ body } = await server.get('/api/v1/sidetree').set('Accept', 'application/json'));
  });
});
