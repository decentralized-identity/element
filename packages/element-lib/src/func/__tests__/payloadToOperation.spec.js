const element = require('../../../index');

const {
  aliceKeys,

  createPayloadTemplate,
  updatePayloadTemplate,

  aliceEncodedCreateOp,
  aliceEncodedUpdateOp,
} = require('../../__tests__/__fixtures__');

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

  it.skip('delete', async () => {
    console.warn('delete op not implemented.');
  });
});
