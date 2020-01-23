import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';

import { Pages } from '../../index';

import { Ledger } from '../../Ledger';
import { Storage } from '../../Storage';

export class BrowserNodeInfoPage extends Component {
  render() {
    const { sidetree } = this.props;
    return (
      <Pages.WithNavigation>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={9}>
            <Ledger />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Storage sidetree={sidetree} />
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

BrowserNodeInfoPage.propTypes = {
  sidetree: PropTypes.any,
};
