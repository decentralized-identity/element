const _ = require('lodash');
const element = require('../../../index');

const aliceKeys = {
  publicKey: '0249b2d0d92622bdf194a2af90f9d166e0dd324aff9b42c8727de90e887d76a4dc',
  privateKey: '00948f44e9e52943d83bd72620d9c79e4533f1d065f57e988bf9b1da1bfd0681',
};

const bobKeys = {
  publicKey: '02f2da1e2ca517f8e89d4106dd4f94aeaebef0039c8510deeb9cfe6e0239dbddeb',
  privateKey: '0418662b18b7cadbcdbe5f322e702178a8d287f8c40697a2135d7537f34b92de',
};

const createPayloadTemplate = {
  '@context': 'https://w3id.org/did/v1',
  publicKey: [
    {
      id: '#key1',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '034ee0f670fc96bb75e8b89c068a1665007a41c98513d6a911b6137e2d16f1d300',
    },
  ],
};

const updatePayloadTemplate = {
  did: 'did:sidetree:EiDFDFUSgoxlZoxSlu-17yz_FmMCIx4hpSareCE7IRZv0A',
  previousOperationHash: 'EiDFDFUSgoxlZoxSlu-17yz_FmMCIx4hpSareCE7IRZv0A',
  patch: [
    {
      op: 'replace',
      path: '/publicKey/1',
      value: {
        id: '#key2',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: '029a4774d543094deaf342663ae672728e12f03b3b6d9816b0b79995fade0fab23',
      },
    },
  ],
};

const inMemoryStorage = {};

const storage = {
  write: async (object) => {
    const cid = await element.func.objectToMultihash(object);
    inMemoryStorage[cid] = object;
    return cid;
  },
  read: async cid => inMemoryStorage[cid],
};

const blockchain = {
  write: anchorFileHash => ({
    transactionTime: 53,
    transactionTimeHash: '0xa6dd7120730ddccf4788a082b0b5607fd1f39dbb80ebc170678551878b90b835',
    transactionNumber: 15,
    anchorFileHash,
  }),
};

const alicePatch = [
  { op: 'add', path: '/lastName', value: 'Wester' },
  {
    op: 'add',
    path: '/contactDetails/phoneNumbers/0',
    value: { number: '555-123' },
  },
];

const aliceEncodedCreateOp = 'eyJoZWFkZXIiOnsib3BlcmF0aW9uIjoiY3JlYXRlIiwia2lkIjoiI2tleTEiLCJhbGciOiJFUzI1NksiLCJwcm9vZk9mV29yayI6e319LCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdlpHbGtMM1l4SWl3aWNIVmliR2xqUzJWNUlqcGJleUpwWkNJNklpTnJaWGt4SWl3aWRIbHdaU0k2SWxObFkzQXlOVFpyTVZabGNtbG1hV05oZEdsdmJrdGxlVEl3TVRnaUxDSndkV0pzYVdOTFpYbElaWGdpT2lJd01qUTVZakprTUdRNU1qWXlNbUprWmpFNU5HRXlZV1k1TUdZNVpERTJObVV3WkdRek1qUmhabVk1WWpReVl6ZzNNamRrWlRrd1pUZzROMlEzTm1FMFpHTWlmVjE5Iiwic2lnbmF0dXJlIjoiQUFmcFBjVVJibmNhVFdvLTk1TUY2eHZMYXZ6YjZ3bDgxdWZoU1ZjQTRZUS1xeVJkLWJBV1gxTGpFY09wQ0Z3ZkVYVzFxV3VfSTVyNE5BeVJyMU4yZEEifQ';

const aliceEncodedUpdateOp = 'eyJoZWFkZXIiOnsib3BlcmF0aW9uIjoidXBkYXRlIiwia2lkIjoiI2tleTEiLCJhbGciOiJFUzI1NksiLCJwcm9vZk9mV29yayI6e319LCJwYXlsb2FkIjoiZXlKa2FXUWlPaUprYVdRNmMybGtaWFJ5WldVNlJXbEVSa1JHVlZObmIzaHNXbTk0VTJ4MUxURTNlWHBmUm0xTlEwbDROR2h3VTJGeVpVTkZOMGxTV25Zd1FTSXNJbTl3WlhKaGRHbHZiazUxYldKbGNpSTZNU3dpY0hKbGRtbHZkWE5QY0dWeVlYUnBiMjVJWVhOb0lqb2lSV2xFUmtSR1ZWTm5iM2hzV205NFUyeDFMVEUzZVhwZlJtMU5RMGw0Tkdod1UyRnlaVU5GTjBsU1duWXdRU0lzSW5CaGRHTm9JanBiZXlKdmNDSTZJbkpsY0d4aFkyVWlMQ0p3WVhSb0lqb2lMM0IxWW14cFkwdGxlUzh4SWl3aWRtRnNkV1VpT25zaWFXUWlPaUlqYTJWNU1pSXNJblI1Y0dVaU9pSlRaV053TWpVMmF6RldaWEpwWm1sallYUnBiMjVMWlhreU1ERTRJaXdpY0hWaWJHbGpTMlY1U0dWNElqb2lNREk1WVRRM056UmtOVFF6TURrMFpHVmhaak0wTWpZMk0yRmxOamN5TnpJNFpURXlaakF6WWpOaU5tUTVPREUyWWpCaU56azVPVFZtWVdSbE1HWmhZakl6SW4xOVhYMCIsInNpZ25hdHVyZSI6IlRmOXZua0Q0NUVhSUg2c0N0LUh2TjRxT196Nk04MXVkNF8tMnNHVTZoSmhUa2xLamlqRW5uSkxKZHVDUHJDbEJ2SnhkekVTYlVGTk1kTnU0RXlYRS1BIn0';

const aliceEncodedDeleteOp = 'eyJoZWFkZXIiOnsib3BlcmF0aW9uIjoiZGVsZXRlIiwia2lkIjoiI2tleTEiLCJhbGciOiJFUzI1NksiLCJwcm9vZk9mV29yayI6e319LCJwYXlsb2FkIjoiZXlKa2FXUWlPaUprYVdRNlpXeGxiVG94TWpNaWZRIiwic2lnbmF0dXJlIjoiQkd1aERoSHlrdG1JcU5HV2plMUc0UUpXN3YyMXdyR0tySF8zWkNwajNMZEZBTnBMNkJnVlNVWEROVTRMTHNRcDFkRmhHR041dF9DYUMwNkhGRjZEa1EifQ';

const aliceEncodedRecoverOp = 'eyJoZWFkZXIiOnsib3BlcmF0aW9uIjoicmVjb3ZlciIsImtpZCI6IiNrZXkxIiwiYWxnIjoiRVMyNTZLIiwicHJvb2ZPZldvcmsiOnt9fSwicGF5bG9hZCI6ImV5SmthV1FpT2lKa2FXUTZjMmxrWlhSeVpXVTZNVEl6SWl3aWIzQmxjbUYwYVc5dVRuVnRZbVZ5SWpveUxDSndjbVYyYVc5MWMwOXdaWEpoZEdsdmJraGhjMmdpT2lKcGJuWmhiR2xrSWl3aWNHRjBZMmdpT2x0N0ltOXdJam9pY21Wd2JHRmpaU0lzSW5CaGRHZ2lPaUl2Y0hWaWJHbGpTMlY1THpFaUxDSjJZV3gxWlNJNmV5SnBaQ0k2SWlOeVpXTnZkbVZ5ZVNJc0luUjVjR1VpT2lKVFpXTndNalUyYXpGV1pYSnBabWxqWVhScGIyNUxaWGt5TURFNElpd2ljSFZpYkdsalMyVjVTR1Y0SWpvaU1ESTBPV0l5WkRCa09USTJNakppWkdZeE9UUmhNbUZtT1RCbU9XUXhOalpsTUdSa016STBZV1ptT1dJME1tTTROekkzWkdVNU1HVTRPRGRrTnpaaE5HUmpJbjE5WFgwIiwic2lnbmF0dXJlIjoiekt5R3JhUTNiLVI0ZzlCcHU4ckJiU0ZQelZPQzlrYXhJMmVGRjJHVlA4QnF3WS1hSUw4TXFWTEdSNjd6aDFmcC1xckpMZTY5a3JtZVZ5MU56emplY3cifQ';

const aliceCreateBatchFile = {
  operations: [
    'eyJoZWFkZXIiOnsib3BlcmF0aW9uIjoiY3JlYXRlIiwia2lkIjoiI2tleTEiLCJhbGciOiJFUzI1NksiLCJwcm9vZk9mV29yayI6e319LCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdlpHbGtMM1l4SWl3aWNIVmliR2xqUzJWNUlqcGJleUpwWkNJNklpTnJaWGt4SWl3aWRIbHdaU0k2SWxObFkzQXlOVFpyTVZabGNtbG1hV05oZEdsdmJrdGxlVEl3TVRnaUxDSndkV0pzYVdOTFpYbElaWGdpT2lJd01qUTVZakprTUdRNU1qWXlNbUprWmpFNU5HRXlZV1k1TUdZNVpERTJObVV3WkdRek1qUmhabVk1WWpReVl6ZzNNamRrWlRrd1pUZzROMlEzTm1FMFpHTWlmVjE5Iiwic2lnbmF0dXJlIjoiQUFmcFBjVVJibmNhVFdvLTk1TUY2eHZMYXZ6YjZ3bDgxdWZoU1ZjQTRZUS1xeVJkLWJBV1gxTGpFY09wQ0Z3ZkVYVzFxV3VfSTVyNE5BeVJyMU4yZEEifQ',
  ],
};

const aliceCreateAnchorFile = {
  batchFileHash: 'QmW6WgD2WDuGpegW5YiwfSsGCGoVfgEc3LN6adDJfrvZwg',
  merkleRoot: '5ff851e29d82e74b0df0c6c3016fb6bb72c7c78144552c31c0537aed518215d6',
};

const generateActor = () => {
  const keypair = element.func.createKeys();
  const createPayload = {
    ...createPayloadTemplate,
  };
  createPayload.publicKey[0].publicKeyHex = keypair.publicKey;
  const uid = element.func.payloadToHash(createPayload);
  return {
    uid,
    keypair,
  };
};

const generateCreates = async (actorMap) => {
  const operations = [];
  _.values(actorMap).forEach(async (actor) => {
    const operation = await element.func.payloadToOperation({
      type: 'create',
      kid: '#key1',
      payload: {
        '@context': 'https://w3id.org/did/v1',
        publicKey: [
          {
            id: '#key1',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: actor.keypair.publicKey,
          },
        ],
      },
      privateKey: actor.keypair.privateKey,
    });
    // eslint-disable-next-line
    actorMap[actor.uid].createOp = operation;
    operations.push(operation);
  });
  return operations;
};

const generateUpdate1 = async (actorMap) => {
  const operations = [];
  _.values(actorMap).forEach(async (actor) => {
    const keypair = element.func.createKeys();
    const operation = await element.func.payloadToOperation({
      type: 'update',
      kid: '#key1',
      payload: {
        didUniqueSuffix: `${actor.uid}`,
        previousOperationHash: actor.uid,
        patch: [
          {
            op: 'replace',
            path: '/publicKey/1',
            value: {
              id: '#key2',
              type: 'Secp256k1VerificationKey2018',
              publicKeyHex: keypair.publicKey,
            },
          },
        ],
      },
      privateKey: actor.keypair.privateKey,
    });
    operations.push(operation);

    // eslint-disable-next-line
    actorMap[actor.uid].update1 = operation;
    // eslint-disable-next-line
    actorMap[actor.uid].update1Kepair = keypair;
  });
  return operations;
};

const primaryKeypair = {
  publicKey: '0286cdfebc43519c64baf08017b9f14a66871ee907770e6bc8fcd62282ebc72dc0',
  privateKey: '68be85c3ca96c4f67056e57c1a6d9169734b54ab87ed9a853e349461da0e8c0e',
};

const primaryKeypair2 = {
  publicKey: '028316a20dd69c606df6d5e13013d151d7414814f417c13079bed6cd0ee4d8ca3d',
  privateKey: 'f6ad23e902f6228d1bc4e8d2551fb48b403550e44720dd66b5a2b62ed862163e',
};

const secondaryKeypair = {
  publicKey: '0353ece606c1be9e28416cdb4a51f78db13efab1b55837c1fa584d4c36b01d10d0',
  privateKey: 'b338c1c9ae9f5649c57fcf79de8daf9e4bcaacdadffa055892baf7d34cd24a24',
};

const recoveryKeypair = {
  publicKey: '0234835352ed6924be6ad5e2caed0a366c92987ddaed52a76fa91602846ac8fda3',
  privateKey: 'a9ab60d0be5f8c114c374825320bc592fa768674ee815388f92f577d23a7cb4e',
};

const recoveryKeypair2 = {
  publicKey: '03e4eb42abd2c98a9063a9af13baa6dd1e5fd8e223f164f5d362439a3a6700e268',
  privateKey: '64548c3886186a07bcd2f53914dd88dbc25a5965e1168f3ae431661f8265e45f',
};

module.exports = {
  aliceKeys,
  bobKeys,
  createPayloadTemplate,
  updatePayloadTemplate,
  storage,
  blockchain,
  alicePatch,
  aliceEncodedCreateOp,
  aliceEncodedUpdateOp,
  aliceEncodedRecoverOp,
  aliceEncodedDeleteOp,
  aliceCreateBatchFile,
  aliceCreateAnchorFile,
  generateActor,
  generateCreates,
  generateUpdate1,
  primaryKeypair,
  primaryKeypair2,
  secondaryKeypair,
  recoveryKeypair,
  recoveryKeypair2,
};
