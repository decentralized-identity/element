import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography } from '@material-ui/core';


import config from '../../config';

export class Ledger extends Component {
  state = {};

  async componentWillMount() {
    if (!window.web3) {
      // eslint-disable-next-line
      alert('MetaMask is required to use this demo.');
    } else {
      window.web3.eth.getAccounts((err, accounts) => {
        if (err) {
          console.error(err);
          return;
        }
        if (!accounts.length) {
          // eslint-disable-next-line
          alert('MetaMask is required to use this demo.');
          return;
        }
        window.web3.eth.getBalance(accounts[0], async (err, balance) => {
          const bal = balance.toNumber();
          this.setState({
            ...this.state,
            account: accounts[0],
            balance: bal,
            networkVersion: window.web3.currentProvider.networkVersion,
          });
        });
      });
    }
  }

  render() {
    return (
      <Paper className="Ledger" style={{ padding: '8px', wordBreak: 'break-all' }}>
        <Typography variant={'h5'}>Ledger</Typography>
        <Typography>Network: {this.state.networkVersion}</Typography>
        <Typography>Account: {this.state.account}</Typography>
        <Typography>Balance: {this.state.balance}</Typography>
        <Typography>Contract: {config.ELEMENT_CONTRACT_ADDRESS}</Typography>
        <Typography>Start Block: {config.ELEMENT_START_BLOCK}</Typography>

        {this.props.operationCount && (
          <Typography>Operations: {this.props.operationCount}</Typography>
        )}
      </Paper>
    );
  }
}

Ledger.propTypes = {
  operationCount: PropTypes.any,
};

export default Ledger;
