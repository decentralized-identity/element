// eslint-disable-next-line
const request = require('supertest');

const element = require('@transmute/element-lib');

const app = require('../../../../express/app');

describe('sidetree', () => {
  let uid;
  let encodedCreatePayload;
  let encodedPayload;
  let previousOperationHash;

  let firstKeypair;
  let secondKeypair;

  beforeAll(async () => {
    firstKeypair = await element.func.createKeys();
    secondKeypair = await element.func.createKeys();
  });

  describe('POST /sidetree', () => {
    it('supports create', async () => {
      const payload = {
        '@context': 'https://w3id.org/did/v1',
        publicKey: [
          {
            id: '#key1',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: firstKeypair.publicKey,
          },
        ],
      };

      uid = element.func.payloadToHash(payload);

      encodedPayload = element.func.encodeJson(payload);
      encodedCreatePayload = encodedPayload;
      const signature = element.func.signEncodedPayload(encodedPayload, firstKeypair.privateKey);
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

      const { body } = await request(app)
        .post('/api/v1/sidetree')
        .send(requestBody)
        .set('Accept', 'application/json');

      expect(body.transactionTime).toBeDefined();
      expect(body.transactionTimeHash).toBeDefined();
      expect(body.transactionNumber).toBeDefined();
      expect(body.anchorFileHash).toBeDefined();

      const res = await request(app)
        .get('/api/v1/sidetree')
        .set('Accept', 'application/json');

      // eslint-disable-next-line
      expect(res.body[uid].previousOperationHash).toBe(element.func.payloadToHash(requestBody));
      // eslint-disable-next-line
      previousOperationHash = res.body[uid].previousOperationHash;
    });

    it('supports update', async () => {
      const payload = {
        did: `did:sidetree:${uid}`,
        operationNumber: 1,
        previousOperationHash,
        patch: [
          {
            op: 'replace',
            path: '/publicKey/1',
            value: {
              id: '#key2',
              type: 'Secp256k1VerificationKey2018',
              publicKeyHex: secondKeypair.publicKey,
            },
          },
        ],
      };

      encodedPayload = element.func.encodeJson(payload);
      const signature = element.func.signEncodedPayload(encodedPayload, firstKeypair.privateKey);
      const requestBody = {
        header: {
          operation: 'update',
          kid: '#key1',
          alg: 'ES256K',
          proofOfWork: {},
        },
        payload: encodedPayload,
        signature,
      };

      const { body } = await request(app)
        .post('/api/v1/sidetree')
        .send(requestBody)
        .set('Accept', 'application/json');

      expect(body.transactionTime).toBeDefined();
      expect(body.transactionTimeHash).toBeDefined();
      expect(body.transactionNumber).toBeDefined();
      expect(body.anchorFileHash).toBeDefined();

      const res = await request(app)
        .get('/api/v1/sidetree')
        .set('Accept', 'application/json');

      // eslint-disable-next-line
      expect(res.body[uid].previousOperationHash).toBe(element.func.payloadToHash(requestBody));
      // eslint-disable-next-line
      previousOperationHash = res.body[uid].previousOperationHash;
      // eslint-disable-next-line
      expect(res.body[uid].doc.publicKey[1].publicKeyHex).toBe(secondKeypair.publicKey);
    });
  });

  describe('GET /sidetree/:did', () => {
    it('resolve a doc by encoding payload', async () => {
      const { body } = await request(app)
        .get(`/api/v1/sidetree/${encodedCreatePayload}`)
        .set('Accept', 'application/json');
      expect(body.id).toBe(`did:elem:${uid}`);
    });

    it('resolve a doc by did', async () => {
      const { body } = await request(app)
        .get(`/api/v1/sidetree/did:elem:${uid}`)
        .set('Accept', 'application/json');

      expect(body.id).toBe(`did:elem:${uid}`);
    });
  });

  describe('GET /sidetree', () => {
    it('should return the whole tree', async () => {
      const { body } = await request(app)
        .get('/api/v1/sidetree')
        .set('Accept', 'application/json');
      expect(body.transactionTime).toBeDefined();
    });
  });
});
