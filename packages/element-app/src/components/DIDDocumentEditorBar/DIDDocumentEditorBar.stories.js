import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { DIDDocumentEditorBar } from './DIDDocumentEditorBar';

const didDocument = {
  '@context': 'https://w3id.org/did/v1',
  publicKey: [
    {
      id: '#key1',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '038311c9ccabb41774c8459d624efe8cda0ed4cd538b0018ce308b5ecb7ab77d60',
    },
  ],
  service: [
    {
      id: '#transmute.element.light-node',
      type: 'Transmute.Element.LightNode',
      serviceEndpoint: 'http://localhost:3000/light-node#0.5884754554028258',
    },
  ],
  id: 'did:elem:YVjYTpfZ4xjM1cyMK9g6d5GYtBEyUbrInWgjdVN1-kk',
};

const wallet = {
  version: 0,
  loading: false,
  data: {
    keys: {
      '0lTVQcq9TmBiXao5luJ8SF_d7-lGk3-8NF3ftYz99EY': {
        type: 'assymetric',
        encoding: 'hex',
        publicKey: '02fee307024caefca84373cbb664c327532092c8ef178cedf472a812525fad2835',
        privateKey: 'cf30d38a1329b5c3dbc60a3d8154315f80296e6cdb393153c8fcb08109803050',
        tags: ['Secp256k1VerificationKey2018', 'WebBrowser'],
        notes: '',
        kid: '0lTVQcq9TmBiXao5luJ8SF_d7-lGk3-8NF3ftYz99EY',
      },
      tiiPnPpFzZy74ZfxM25BfiH6Jrw6Z4_bxHRHt047Eio: {
        type: 'assymetric',
        encoding: 'hex',
        publicKey: '038311c9ccabb41774c8459d624efe8cda0ed4cd538b0018ce308b5ecb7ab77d60',
        privateKey: 'd3fd1191fa392e7c471f88e5f287e47d42f44b37a99573f5fada09eb211a0b02',
        tags: ['Secp256k1VerificationKey2018', 'WebBrowser'],
        notes: '',
        kid: 'tiiPnPpFzZy74ZfxM25BfiH6Jrw6Z4_bxHRHt047Eio',
      },
      lf0CUTWoyrqrypiwO12097QkVgA7OZz_yJqyqiSI3SU: {
        type: 'assymetric',
        encoding: 'hex',
        publicKey: '0391990754cb15bb588c35ef8bee1092ceeac150f6fae8ae54b166b6f247bd4e75',
        privateKey: '17123ab634b45c425bc869211214b5b100ecf30dead4c09e913e1bb82d0c8c26',
        tags: ['Secp256k1VerificationKey2018', 'WebBrowser'],
        notes: '123',
        kid: 'lf0CUTWoyrqrypiwO12097QkVgA7OZz_yJqyqiSI3SU',
      },
    },
  },
  resolving: true,
};

storiesOf('DID Document ', module).add('Editor Bar', () => (
  <DIDDocumentEditorBar
    didDocument={didDocument}
    keys={wallet.data.keys}
    handleAddKey={(key) => {
      action('handle add key: ')(key);
    }}
    handleRemoveKey={(key) => {
      action('handle remove key: ')(key);
    }}
  />
));
