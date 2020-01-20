import React from 'react';
import { storiesOf } from '@storybook/react';
import { SidetreeOperation } from '.';

const operations = [
  {
    operation: {
      operationHash: '4fET45pPTsiTyEvWeFmhgMlu7rnH_s_1vqGH6dXA_ZM',
      decodedOperation: {
        header: {
          operation: 'create',
          kid: '#primary',
          alg: 'ES256K',
        },
        payload:
          'eyJAY29udGV4dCI6Imh0dHBzOi8vdzNpZC5vcmcvZGlkL3YwLjExIiwicHVibGljS2V5IjpbeyJpZCI6IiNwcmltYXJ5IiwidHlwZSI6IlNlY3AyNTZrMVZlcmlmaWNhdGlvbktleTIwMTgiLCJwdWJsaWNLZXlIZXgiOiIwM2ZjNzYwNDA3NGU2ODQwYzVlMmNkMjhjMGFjOTQxNjU3MDQ4NmY4YzAxM2UxNmQ0ZTU5ODVmMzJmMTcxNWRlOGMifSx7ImlkIjoiI3JlY292ZXJ5IiwidHlwZSI6IlNlY3AyNTZrMVZlcmlmaWNhdGlvbktleTIwMTgiLCJwdWJsaWNLZXlIZXgiOiIwM2ZjNzYwNDA3NGU2ODQwYzVlMmNkMjhjMGFjOTQxNjU3MDQ4NmY4YzAxM2UxNmQ0ZTU5ODVmMzJmMTcxNWRlOGMifV19',
        signature:
          'rFai2nZ49IK8og5Pa1jZqrwcIkHnKyMIo2Zvr3GrkZUVi4iz1RkVflRuDmssyIF2gyTQs1lMcxPD7C5P1RIvOA',
      },
      decodedOperationPayload: {
        '@context': 'https://w3id.org/did/v0.11',
        publicKey: [
          {
            id: '#primary',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex:
              '03fc7604074e6840c5e2cd28c0ac9416570486f8c013e16d4e5985f32f1715de8c',
          },
          {
            id: '#recovery',
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex:
              '03fc7604074e6840c5e2cd28c0ac9416570486f8c013e16d4e5985f32f1715de8c',
          },
        ],
      },
    },
    transaction: {
      transactionTime: 6427949,
      transactionTimeHash:
        '0x9352a467034a7a3ea07d696c8fe1d3b573b9d60850ed585e6a597a1dfee8c915',
      transactionHash:
        '0x2715962aab0228ac2cd2a4d13fbfe023e2c3632e8a0b536648dd8e2cf8600c39',
      transactionNumber: 416,
      anchorFileHash: 'QmSoAXE8aFuzhw1Fjdy7dW6kEPE31u4Cduub5ZKaFqwmvQ',
      transactionTimestamp: 1569024138,
    },
  },
];

storiesOf('Sidetree', module).add('Operation', () => (
  <div>
    <SidetreeOperation operation={operations[0]} />
  </div>
));
