import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import { Pages } from '../../components/index';

import KeystoreContainer from '../../containers/KeystoreContainer';

export class KeystorePage extends Component {
  render() {
    return (
      <Pages.WithNavigation>
        <Typography variant="h6" gutterBottom>
          DID Keystore
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          These keys enable you to control your DID or create verifiable
          credentials.
        </Typography>
        <br />
        <KeystoreContainer />
      </Pages.WithNavigation>
    );
  }
}

export default KeystorePage;
