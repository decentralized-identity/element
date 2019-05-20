import React from 'react';
import { storiesOf } from '@storybook/react';
import SidetreeTransaction from '.';

storiesOf('SidetreeTransaction', module).add('SidetreeTransaction', () => (
  <div>
    <h4>Ethereum Ropsten</h4>
    <SidetreeTransaction
      txn={{
        transactionTime: 53,
        transactionTimeHash: '0x93e784ec47f373e8c2aa88119fc5ea586ee4d065fd72ce0e8f71c1f15efc06e0',
        transactionNumber: 15,
        anchorFileHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      }}
      blockchain={'Ethereum'}
      network={'ropsten'}
    />

    <h4>Ethereum Mainnet</h4>
    <SidetreeTransaction
      txn={{
        transactionTime: 42,
        transactionTimeHash: '0x93e784ec47f373e8c2aa88119fc5ea586ee4d065fd72ce0e8f71c1f15efc06e0',
        transactionNumber: 12,
        anchorFileHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      }}
      blockchain={'Ethereum'}
    />

    <h4>Internal Anchor File Base</h4>
    <SidetreeTransaction
      txn={{
        transactionTime: 42,
        transactionTimeHash: '0x93e784ec47f373e8c2aa88119fc5ea586ee4d065fd72ce0e8f71c1f15efc06e0',
        transactionNumber: 12,
        anchorFileHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      }}
      blockchain={'Ethereum'}
      anchorFileBase={'http://example.com'}
    />
  </div>
));
