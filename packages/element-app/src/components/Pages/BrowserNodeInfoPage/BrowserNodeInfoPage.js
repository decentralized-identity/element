import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Pages } from '../../index';

import { Ledger } from '../../Ledger';
import { Storage } from '../../Storage';

export class BrowserNodeInfoPage extends Component {
  render() {
    const { sidetree } = this.props;
    return (
      <Pages.WithNavigation>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Sidetree Browser Node</Typography>
            <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
              This page displays information about your browser sidetree node.
            </Typography>
          </Grid>
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
