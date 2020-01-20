const fixtures = require('./__fixtures__');

const schema = require('./index');

describe('schema', () => {
  it('did key documents are valid', () => {
    const result = schema.validator.isValid(
      fixtures.didDocs[
        'did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs'
      ],
      schema.schemas.didDoc
    );
    expect(result).toBe(true);
  });
});
