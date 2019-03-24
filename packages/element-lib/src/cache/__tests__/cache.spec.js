const element = require('../../../index');

describe('cache', () => {
  it('should get and set', async () => {
    const test = {
      hello: 'world',
    };
    let result = await element.cache.getItem('test');
    expect(result).toBe(null);
    result = await element.cache.setItem('test', test);
    expect(result).toEqual(test);
    result = await element.cache.getItem('test');
    expect(result).toEqual(test);
  });
});
