import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ElementDIDWithTransactions } from './ElementDIDWithTransactions';

import tree from './tree.json';

const records = Object.values(tree);

storiesOf('DID Document', module).add('With Transactions', () => (
  <ElementDIDWithTransactions
    record={records[0]}
    onCopyToClipboard={data => {
      action('onCopyToClipboard')(data);
    }}
  />
));
