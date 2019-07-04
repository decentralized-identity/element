const getLocalSidetree = require('./__fixtures__/getLocalSidetree');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('Closeable');
});

afterAll(async () => {
  await sidetree.close();
});

describe('Closeable', () => {
  it('works', () => {
    console.log('asdf');
  });
});
