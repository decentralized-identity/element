const ElementNanoBusAdapter = require('./ElementNanoBusAdapter');

let serviceBus;

beforeAll(async () => {
  serviceBus = new ElementNanoBusAdapter();
});

afterAll(async () => {
  await serviceBus.close();
});

describe('ElementNanoBusAdapter', () => {
  it('can emit and listen', (done) => {
    serviceBus.on('element:sidetree:transaction:failing', () => {
      done();
    });
    serviceBus.emit('element:sidetree:transaction:failing', {});
  });
});
