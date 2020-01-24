import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { Pages } from '../../index';
import { SidetreeTransaction } from '../../SidetreeTransaction';

import Loading from '../../Loading/Loading';

export class ExplorerPage extends Component {
  componentDidMount() {
    // Only get the last 20 transactions to avoid crashing the page
    this.props.getSidetreeTransactions({ limit: 20 });
  }

  render() {
    const { nodeStore } = this.props;
    const { sidetreeTxns } = nodeStore;
    const prefix = this.props.fullNode ? '/server' : '/dapp';
    return (
      <Pages.WithNavigation>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" style={{ marginBottom: '8px' }}>
              Sidetree Explorer
              {/* TODO: add menu for filtering. */}
              {/* eslint-disable-next-line */}
              {/* ?since=36&transaction-time-hash=0x5e496d4d60b2abd6326ec64298ba9be0bfbb89b5d804f5383381ebb65e8aaf8f */}
            </Typography>

            <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
              Use this page to explore sidetree activities on the ethereum
              network.
            </Typography>
          </Grid>

          {!sidetreeTxns ? (
            <Grid item xs={12}>
              <div style={{ marginTop: '15%' }}>
                <Loading message={'Resolving...'} />
              </div>
            </Grid>
          ) : (
            sidetreeTxns.map(transaction => (
              <Grid item xs={12} key={transaction.transactionNumber}>
                <SidetreeTransaction
                  transaction={transaction}
                  blockchain={'Ethereum'}
                  network={'ropsten'}
                  onClick={transactionHash => {
                    this.props.history.push(
                      `${prefix}/transactions/${transactionHash}`
                    );
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

ExplorerPage.propTypes = {
  nodeStore: PropTypes.object.isRequired,
  getSidetreeTransactions: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  fullNode: PropTypes.object,
};
