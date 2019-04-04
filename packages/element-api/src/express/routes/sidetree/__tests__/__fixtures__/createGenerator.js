const element = require('@transmute/element-lib');

const generateCreate = async () => {
  const firstKeypair = await element.func.createKeys();
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
  // const uid = element.func.payloadToHash(payload);
  const encodedPayload = element.func.encodeJson(payload);
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

  // element.cache.setItem(uid, {
  //   firstKeypair,
  //   create: requestBody,
  // });
  return requestBody;
};

module.exports = generateCreate;
