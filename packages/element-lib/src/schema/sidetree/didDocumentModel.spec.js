const fixtures = require('../__fixtures__');

const schema = require('../index');

describe('didDocumentModel', () => {
  it('supports common did key', () => {
    const doc =
      fixtures.didDocs[
        'did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs'
      ];
    // hack around: https://github.com/decentralized-identity/sidetree/issues/362
    doc.publicKey[0].usage = 'signing';
    doc.keyAgreement[0].usage = 'signing';
    // required because of create restrictions
    delete doc.id;
    const res = schema.validator.validate(
      doc,
      schema.schemas.sidetreeDidDocumentModel,
      {
        throwError: true,
      }
    );
    expect(res.errors).toHaveLength(0);
  });

  it('supports common did work', () => {
    const doc = fixtures.didDocs['did:work:2UUHQCd4psvkPLZGnWY33L'];
    doc['@context'] = 'https://w3id.org/did/v1';
    // hack around: https://github.com/decentralized-identity/sidetree/issues/362
    doc.publicKey[0].usage = 'signing';
    // required because of create restrictions
    delete doc.id;
    const res = schema.validator.validate(
      doc,
      schema.schemas.sidetreeDidDocumentModel,
      {
        throwError: true,
      }
    );
    expect(res.errors).toHaveLength(0);
  });

  it('supports common did github', () => {
    const doc = fixtures.didDocs['did:github:OR13'];

    // hack around: https://github.com/decentralized-identity/sidetree/issues/362
    doc.publicKey.forEach(key => {
      // eslint-disable-next-line
      key.usage = 'signing';
    });

    doc.keyAgreement.forEach(key => {
      // eslint-disable-next-line
      key.usage = 'signing';
    });

    // required because of create restrictions
    delete doc.id;
    const res = schema.validator.validate(
      doc,
      schema.schemas.sidetreeDidDocumentModel,
      {
        throwError: true,
      }
    );
    expect(res.errors).toHaveLength(0);
  });
});
