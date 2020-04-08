const jsonld = require('jsonld');
const jsigs = require('jsonld-signatures');
const { Ed25519KeyPair } = require('crypto-ld');
const fs = require('fs');
const path = require('path');

const { AssertionProofPurpose } = jsigs.purposes;
const { Ed25519Signature2018 } = jsigs.suites;
const didDocumentWithCustomContext = require('./__fixtures__/didDocumentWithCustomContext');

jest.setTimeout(10 * 1000);

const loadContext = relativePath => {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, relativePath)).toString()
  );
};

describe('JSON LD Signatures', () => {
  let suite;
  let documentLoader;

  beforeAll(async () => {
    // Create keypair
    const keyPair = await Ed25519KeyPair.generate({
      id: 'https://example.edu/issuers/keys/1',
      controller: 'https://example.com/i/carol',
    });
    // Create a document loader that knows about the keypair id and controller
    const contexts = {
      [keyPair.id]: keyPair.publicNode(),
      [keyPair.controller]: {
        '@context': 'https://w3id.org/security/v2',
        id: keyPair.controller,
        assertionMethod: [keyPair.id],
      },
      'https://www.w3.org/ns/did/v1': loadContext(
        './__fixtures__/www.w3.org-ns-did-v1.json'
      ),
      'https://docs.element-did.com/contexts/sidetree/sidetree-v0.1.jsonld': loadContext(
        '../../../../docs/contexts/sidetree/sidetree-v0.1.jsonld'
      ),
    };

    documentLoader = async url => {
      // eslint-disable-next-line security/detect-object-injection
      const context = contexts[url];
      if (context) {
        return {
          contextUrl: null,
          documentUrl: url,
          document: context,
        };
      }
      return jsonld.documentLoaders.node()(url);
    };
    suite = new Ed25519Signature2018({
      verificationMethod: keyPair.id,
      key: keyPair,
    });
  });

  it('should sign the document', async () => {
    const purpose = new AssertionProofPurpose();
    const signed = await jsigs.sign(didDocumentWithCustomContext, {
      purpose,
      documentLoader,
      suite,
    });
    expect(signed).toBeDefined();
    expect(signed.proof).toBeDefined();

    const result = await jsigs.verify(signed, {
      purpose,
      documentLoader,
      suite,
    });
    expect(result.verified).toBeTruthy();
  });
});
