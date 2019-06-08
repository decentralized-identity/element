import React from 'react';
import { storiesOf } from '@storybook/react';
import { SidetreeAnchorFile } from '.';

storiesOf('Sidetree', module).add('Anchor File', () => (
  <div>
    <SidetreeAnchorFile
      anchorFile={{
        foo: '',
      }}
    />
  </div>
));
