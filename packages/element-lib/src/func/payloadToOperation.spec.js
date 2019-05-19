const element = require('../../index');

const {
  aliceKeys,

  createPayloadTemplate,
  updatePayloadTemplate,

  aliceEncodedCreateOp,
  aliceEncodedUpdateOp,
  aliceEncodedDeleteOp,
  aliceEncodedRecoverOp,
} = require('../__tests__/__fixtures__');

describe('payloadToOperation', () => {
  it('create', async () => {
    const payload = {
      ...createPayloadTemplate,
    };
    payload.publicKey[0].publicKeyHex = aliceKeys.publicKey;
    const op = await element.func.payloadToOperation({
      type: 'create',
      payload,
      kid: '#key1',
      privateKey: aliceKeys.privateKey,
    });
    expect(op).toBe(aliceEncodedCreateOp);
  });

  it('update', async () => {
    const payload = {
      ...updatePayloadTemplate,
    };
    const op = await element.func.payloadToOperation({
      type: 'update',
      payload,
      kid: '#key1',
      privateKey: aliceKeys.privateKey,
    });
    expect(op).toBe(aliceEncodedUpdateOp);
  });

  it('recover', async () => {
    const payload = {
      didUniqueSuffix: '123',
      previousOperationHash: 'invalid',
      patch: [
        // first op should update recovery key.
        {
          op: 'replace',
          path: '/publicKey/1',
          value: {
            id: '#recovery',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: aliceKeys.publicKey,
          },
        },
      ],
    };
    const op = await element.func.payloadToOperation({
      type: 'recover',
      payload,
      kid: '#key1',
      privateKey: aliceKeys.privateKey,
    });
    expect(op).toBe(aliceEncodedRecoverOp);
  });

  it('delete', async () => {
    const payload = {
      did: 'did:elem:123',
    };
    const op = await element.func.payloadToOperation({
      type: 'delete',
      payload,
      kid: '#key1',
      privateKey: aliceKeys.privateKey,
    });
    expect(op).toBe(aliceEncodedDeleteOp);
  });
});
