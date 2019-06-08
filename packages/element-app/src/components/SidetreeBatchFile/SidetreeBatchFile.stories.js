import React from 'react';
import { storiesOf } from '@storybook/react';
import { SidetreeBatchFile } from '.';

storiesOf('Sidetree', module).add('Batch File', () => (
  <div>
    <SidetreeBatchFile
      batchFile={{
        foo: '',
      }}
    />
  </div>
));
