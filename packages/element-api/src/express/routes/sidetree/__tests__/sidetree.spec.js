const request = require('supertest');

const element = require('@transmute/element-lib');

const app = require('../../../../express/app');

describe('sidetree', () => {
  let uid;
  let encodedPayload;
  describe('POST /sidetree', () => {
    it('Should publish a DID operation', async () => {
      const keys = await element.func.createKeys();
      const payload = {
        '@context': 'https://w3id.org/did/v1',
        publicKey: [
          {
            id: '#key1',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: keys.publicKey,
          },
        ],
      };

      uid = element.func.payloadToHash(payload);

      encodedPayload = element.func.encodeJson(payload);
      const signature = element.func.signEncodedPayload(encodedPayload, keys.privateKey);
      const requestBody = {
        header: {
          operation: 'create',
          kid: '#key1',
          alg: 'ES256K',
          proofOfWork: {},
        },
        payload: encodedPayload,
        signature,
      };

      console.log(JSON.stringify(requestBody, null, 2))

      const { body } = await request(app)
        .post('/api/v1/sidetree')
        .send(requestBody)
        .set('Accept', 'application/json');

      expect(body.transactionTime).toBeDefined();
      expect(body.transactionTimeHash).toBeDefined();
      expect(body.transactionNumber).toBeDefined();
      expect(body.anchorFileHash).toBeDefined();
    });
  });

  describe('GET /sidetree/:did', () => {
    it('resolve a doc by encoding payload', async () => {
      const { body } = await request(app)
        .get(`/api/v1/sidetree/${encodedPayload}`)
        .set('Accept', 'application/json');
      // only id property is added on create.
      delete body.id;
      const reEncodedPayload = element.func.encodeJson(body);
      expect(reEncodedPayload).toBe(encodedPayload);
    });

    it('resolve a doc by did', async () => {
      const { body } = await request(app)
        .get(`/api/v1/sidetree/did:elem:${uid}`)
        .set('Accept', 'application/json');
      // only id property is added on create.
      delete body.id;
      const reEncodedPayload = element.func.encodeJson(body);
      expect(reEncodedPayload).toBe(encodedPayload);
    });
  });
});
