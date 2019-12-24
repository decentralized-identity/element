const fixtures = require('../__fixtures__');

const schema = require('../index');

describe('didDocumentModel', () => {
  it('supports service definitions', () => {
    const doc = fixtures.didDocs['did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs'];
    // hack around: https://github.com/decentralized-identity/sidetree/issues/362
    doc.publicKey[0].usage = 'signing';
    doc.keyAgreement[0].usage = 'signing';
    // required because of create restrictions
    delete doc.id;
    schema.validator.validate(doc, schema.schemas.sidetreeDidDocumentModel, { throwError: true });
  });
});
