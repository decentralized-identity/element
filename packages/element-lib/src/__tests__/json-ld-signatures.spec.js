const jsonld = require('jsonld');
const jsigs = require('jsonld-signatures');
const { Ed25519KeyPair } = require("crypto-ld");
const { keyToDidDoc } = require('did-method-key').driver();

const { AssertionProofPurpose } = jsigs.purposes;
const { Ed25519Signature2018 } = jsigs.suites;
const didDocumentWithCustomContext = require('./__fixtures__/didDocumentWithCustomContext')

describe('JSON LD Signatures', () => {
  let suite;

  beforeAll(async () => {
    // Generate keypair to sign
    const keyPair = await Ed25519KeyPair.generate();
    const didDocument = keyToDidDoc(keyPair);
    suite = new Ed25519Signature2018({
      issuerVerificationMethod: didDocument.id,
      key: keyPair
    });
  });

  it('should sign the document', async () => {
    const documentLoader = jsonld.documentLoaders.node();
    const purpose = new AssertionProofPurpose();
    const signed = await jsigs.sign(didDocumentWithCustomContext, {
      purpose,
      documentLoader,
      suite,
    });
    console.log(signed);
    expect(signed).toBeDefined();
  })
});
