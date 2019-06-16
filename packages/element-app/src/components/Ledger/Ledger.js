import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography } from '@material-ui/core';

import config from '../../config';

export class Ledger extends Component {
  state = {};

  async componentDidMount() {
    if (!window.web3) {
      // eslint-disable-next-line
      alert('MetaMask is required to use this demo, please use the LATEST VERSION.');
    } else {
      setTimeout(() => {
        window.web3.eth.net.getNetworkType().then((networkVersion) => {
          this.setState({
            networkVersion,
          });
        });
      }, 0.5 * 1000);

      window.web3.eth.getAccounts(async (err, accounts) => {
        if (err) {
          console.error(err);
          return;
        }
        if (!accounts.length) {
          // eslint-disable-next-line
          alert('MetaMask is required to use this demo, please use the LATEST VERSION.');
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
      <Paper className="Ledger" style={{ padding: '8px', wordBreak: 'break-all' }}>
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
  operationCount: PropTypes.any,
};

export default Ledger;
