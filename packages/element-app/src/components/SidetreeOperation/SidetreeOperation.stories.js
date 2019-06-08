import React from 'react';
import { storiesOf } from '@storybook/react';
import { SidetreeOperation } from '.';

storiesOf('Sidetree', module).add('Operation', () => (
  <div>
    <SidetreeOperation
      batchFile={{
        foo: '',
      }}
    />
  </div>
));
