import React from 'react';
import { storiesOf } from '@storybook/react';
import { SidetreeTransaction } from '.';

storiesOf('SidetreeTransaction', module).add('SidetreeTransaction', () => (
  <div>
    <h4>Ethereum Ropsten</h4>
    <SidetreeTransaction
      transaction={{
        transactionTime: 53,
        transactionTimeHash: '0x93e784ec47f373e8c2aa88119fc5ea586ee4d065fd72ce0e8f71c1f15efc06e0',
        transactionHash: '0x2715962aab0228ac2cd2a4d13fbfe023e2c3632e8a0b536648dd8e2cf8600c39',
        transactionNumber: 15,
        anchorFileHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      }}
      blockchain={'Ethereum'}
      network={'ropsten'}
    />

    <h4>Ethereum Mainnet</h4>
    <SidetreeTransaction
      transaction={{
        transactionTime: 42,
        transactionTimeHash: '0x93e784ec47f373e8c2aa88119fc5ea586ee4d065fd72ce0e8f71c1f15efc06e0',
        transactionHash: '0x2715962aab0228ac2cd2a4d13fbfe023e2c3632e8a0b536648dd8e2cf8600c39',
        transactionNumber: 12,
        anchorFileHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      }}
      blockchain={'Ethereum'}
    />

    <h4>Internal Anchor File Base</h4>
    <SidetreeTransaction
      transaction={{
        transactionTime: 42,
        transactionTimeHash: '0x93e784ec47f373e8c2aa88119fc5ea586ee4d065fd72ce0e8f71c1f15efc06e0',
        transactionHash: '0x2715962aab0228ac2cd2a4d13fbfe023e2c3632e8a0b536648dd8e2cf8600c39',
        transactionNumber: 12,
        anchorFileHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      }}
      blockchain={'Ethereum'}
      anchorFileBase={'http://example.com'}
    />
  </div>
));
