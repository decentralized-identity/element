import React, { Component } from 'react';

import { withRouter } from 'react-router';

import Web3 from 'web3';

const withMetaMask = (WrappedComponent) => {
  // eslint-disable-next-line
  const HOC = class extends Component {
    componentDidMount() {
      window.addEventListener('load', async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          try {
            // Request account access if needed
            await window.ethereum.enable();
            // Acccounts now exposed
          } catch (error) {
            console.log(error);
          }
        } else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
        } else {
          // eslint-disable-next-line
          alert('MetaMask is required to use this demo, please use the LATEST VERSION.');
        }
      });
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return withRouter(HOC);
};

export default withMetaMask;
