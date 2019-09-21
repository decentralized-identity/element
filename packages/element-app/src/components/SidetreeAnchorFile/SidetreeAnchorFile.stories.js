import React from 'react';
import { storiesOf } from '@storybook/react';
import { SidetreeAnchorFile } from '.';

const anchorFile = {
  batchFileHash: 'QmSXdFQsKWRS6qJLSDgjAG7SLsFfiwJkDK5NDyUScVEjjo',
  didUniqueSuffixes: ['4fET45pPTsiTyEvWeFmhgMlu7rnH_s_1vqGH6dXA_ZM'],
  merkleRoot: '6f30080a99f005c0c49a962a5a96b401cc5f6b45ec2c0c723dcec883fa58f16a',
};

storiesOf('Sidetree', module).add('Anchor File', () => (
  <div>
    <SidetreeAnchorFile
      anchorFileHash={'QmSoAXE8aFuzhw1Fjdy7dW6kEPE31u4Cduub5ZKaFqwmvQ'}
      anchorFile={anchorFile}
    />
  </div>
));
