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

class DAppElementExplorerPage extends Component {
  componentWillMount() {
    const searchParams = new URLSearchParams(window.location.search);
    const since = searchParams.get('since');
    const transactionTimeHash = searchParams.get('transaction-time-hash');
    if (since && transactionTimeHash) {
      this.props.getSidetreeTransactions({ since, transactionTimeHash });
    } else {
      this.props.getSidetreeTransactions();
    }
  }

  render() {
    const { lightNode } = this.props;
    const { sidetreeTxns } = lightNode;
    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant="h3" style={{ marginBottom: '8px' }}>
              Element Explorer
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Ledger />
          </Grid>
          <Grid item xs={12}>
            <Storage />
          </Grid>

          {!sidetreeTxns ? (
            <Grid item xs={12}>
              <LinearProgress color="primary" variant="query" />
            </Grid>
          ) : (
            sidetreeTxns.map(txn => (
              <Grid item xs={12} key={txn.transactionNumber}>
                <SidetreeTransaction
                  txn={txn}
                  blockchain={'Ethereum'}
                  network={'ropsten'}
                  onClickTransactionTimeHash={(transactionTimeHash) => {
                    this.props.history.push(`/dapp/transactions/${transactionTimeHash}`);
                  }}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

DAppElementExplorerPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  getSidetreeTransactions: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

const ConnectedDAppElementExplorerPage = compose(
  withRouter,
  ligthNode.container,
)(DAppElementExplorerPage);

export { ConnectedDAppElementExplorerPage as DAppElementExplorerPage };

export default ConnectedDAppElementExplorerPage;
