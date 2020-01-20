import React from 'react';
import { storiesOf } from '@storybook/react';
import { SidetreeBatchFile } from '.';

const batchFile = {
  operations: [
    'eyJoZWFkZXIiOnsib3BlcmF0aW9uIjoiY3JlYXRlIiwia2lkIjoiI3ByaW1hcnkiLCJhbGciOiJFUzI1NksifSwicGF5bG9hZCI6ImV5SkFZMjl1ZEdWNGRDSTZJbWgwZEhCek9pOHZkek5wWkM1dmNtY3ZaR2xrTDNZd0xqRXhJaXdpY0hWaWJHbGpTMlY1SWpwYmV5SnBaQ0k2SWlOd2NtbHRZWEo1SWl3aWRIbHdaU0k2SWxObFkzQXlOVFpyTVZabGNtbG1hV05oZEdsdmJrdGxlVEl3TVRnaUxDSndkV0pzYVdOTFpYbElaWGdpT2lJd00yWmpOell3TkRBM05HVTJPRFF3WXpWbE1tTmtNamhqTUdGak9UUXhOalUzTURRNE5tWTRZekF4TTJVeE5tUTBaVFU1T0RWbU16Sm1NVGN4TldSbE9HTWlmU3g3SW1sa0lqb2lJM0psWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TTJaak56WXdOREEzTkdVMk9EUXdZelZsTW1Oa01qaGpNR0ZqT1RReE5qVTNNRFE0Tm1ZNFl6QXhNMlV4Tm1RMFpUVTVPRFZtTXpKbU1UY3hOV1JsT0dNaWZWMTkiLCJzaWduYXR1cmUiOiJyRmFpMm5aNDlJSzhvZzVQYTFqWnFyd2NJa0huS3lNSW8yWnZyM0dya1pVVmk0aXoxUmtWZmxSdURtc3N5SUYyZ3lUUXMxbE1jeFBEN0M1UDFSSXZPQSJ9',
  ],
};

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
  },
];

const transaction = {
  transactionTime: 6427949,
  transactionTimeHash:
    '0x9352a467034a7a3ea07d696c8fe1d3b573b9d60850ed585e6a597a1dfee8c915',
  transactionHash:
    '0x2715962aab0228ac2cd2a4d13fbfe023e2c3632e8a0b536648dd8e2cf8600c39',
  transactionNumber: 416,
  anchorFileHash: 'QmSoAXE8aFuzhw1Fjdy7dW6kEPE31u4Cduub5ZKaFqwmvQ',
  transactionTimestamp: 1569024138,
};

storiesOf('Sidetree', module).add('Batch File', () => (
  <div>
    <SidetreeBatchFile
      batchFileHash={'QmSXdFQsKWRS6qJLSDgjAG7SLsFfiwJkDK5NDyUScVEjjo'}
      batchFile={batchFile}
      operations={operations}
      transaction={transaction}
    />
  </div>
));
