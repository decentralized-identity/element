import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import { Typography, Grid, LinearProgress } from '@material-ui/core';

import { Pages } from '../../../components/index';

import ligthNode from '../../../redux/lightNode';

import { Ledger } from '../../../components/Ledger';
import { Storage } from '../../../components/Storage';
import { SidetreeTransaction } from '../../../components/SidetreeTransaction';
import { SidetreeAnchorFile } from '../../../components/SidetreeAnchorFile';
import { SidetreeBatchFile } from '../../../components/SidetreeBatchFile';

class DAppElementTransactionPage extends Component {
  componentWillMount() {
    this.props.getSidetreeOperationsFromTransactionTimeHash(
      this.props.match.params.transactionTimeHash,
    );
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  render() {
    const { lightNode } = this.props;
    const { sidetreeTxn } = lightNode;
    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant="h3" style={{ marginBottom: '8px' }}>
              Element Transaction
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Ledger />
          </Grid>
          <Grid item xs={6}>
            <Storage />
          </Grid>
          <Grid item xs={12}>
            {!sidetreeTxn ? (
              <LinearProgress color="primary" variant="query" />
            ) : (
              <React.Fragment>
                <SidetreeTransaction
                  txn={sidetreeTxn.txn}
                  blockchain={'Ethereum'}
                  network={'ropsten'}
                  expanded={true}
                />

                <SidetreeAnchorFile
                  anchorFileHash={sidetreeTxn.txn.anchorFileHash}
                  anchorFile={sidetreeTxn.anchorFile}
                  onClickUID={(uid) => {
                    this.props.history.push(`/dapp/explorer/operations/${uid}`);
                  }}
                  expanded={true}
                />

                <SidetreeBatchFile
                  batchFileHash={sidetreeTxn.anchorFile.batchFileHash}
                  batchFile={sidetreeTxn.batchFile}
                  operations={sidetreeTxn.operations}
                  // onClickUID={(uid) => {
                  //   this.props.history.push(`/operations/${uid}`);
                  // }}
                  expanded={true}
                />
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

DAppElementTransactionPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  getSidetreeOperationsFromTransactionTimeHash: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

const ConnectedDAppElementTransactionPage = compose(
  withRouter,
  ligthNode.container,
)(DAppElementTransactionPage);

export { ConnectedDAppElementTransactionPage as DAppElementTransactionPage };

export default ConnectedDAppElementTransactionPage;
