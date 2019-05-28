import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';


import { DIDDocumentHeader } from './DIDDocumentHeader';

const didDocument = {
  '@context': 'https://w3id.org/did/v1',
  publicKey: [
    {
      id: '#key1',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '02c7689c4e8d6deda60f2e87ad235ee1e7e25f8685910b44f3c66188313e6f4532',
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

storiesOf('DID Document ', module).add('Header', () => (
  <DIDDocumentHeader did={didDocument.id} onCopyToClipboard={(item)=>{
    action('copied to clipboard: ')(item)
  }} />
));
