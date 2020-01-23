import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import { Pages } from '../../components/index';

import KeystoreContainer from '../../containers/KeystoreContainer';

export class KeystorePage extends Component {
  render() {
    return (
      <Pages.WithNavigation>
        <Typography variant="h6" gutterBottom>
          A DID Keystore is required to store keys used to sign Sidetree
          Operations, whether you are anchoring them to a blockchain yourself,
          or using a server / full node.
        </Typography>
        <br />
        <KeystoreContainer />
      </Pages.WithNavigation>
    );
  }
}

export default KeystorePage;
