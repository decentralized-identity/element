import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import config from '../../config';

export class Ledger extends Component {
  state = {};

  async componentDidMount() {
    if (window.web3) {
      // eslint-disable-next-line
      setTimeout(() => {
        window.web3.eth.net.getNetworkType().then(networkVersion => {
          this.setState({
            networkVersion,
          });
        });
      }, 0.5 * 1000);

      window.web3.eth.getAccounts(async (err, accounts) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          return;
        }
        if (!accounts.length) {
          // eslint-disable-next-line
          return;
        }

        this.setState({
          account: accounts[0],
        });
      });
    }
  }

  render() {
    return (
      <Paper
        className="Ledger"
        style={{ padding: '8px', wordBreak: 'break-all' }}
      >
        <Typography variant={'h5'}>Ethereum</Typography>
        <Typography>Network: {this.state.networkVersion}</Typography>
        <Typography>Contract: {config.ELEMENT_CONTRACT_ADDRESS}</Typography>
        <Typography>Start Block: {config.ELEMENT_START_BLOCK}</Typography>
        <Typography>Your Account: {this.state.account}</Typography>
      </Paper>
    );
  }
}

Ledger.propTypes = {
  sidetree: PropTypes.any,
};

export default Ledger;
