import React, { Component } from 'react';

import { withRouter } from 'react-router';

import Web3 from 'web3';

const withMetaMask = (WrappedComponent, options = {}) => {
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
            // web3.eth.sendTransaction({
            //   /* ... */
            // });
          } catch (error) {
            // User denied account access...
            console.log(error);
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
          // Acccounts always exposed
        }
        // Non-dapp browsers...
        else {
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
