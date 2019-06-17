import React, { Component } from 'react';

import { withRouter } from 'react-router';

import Web3 from 'web3';

import { initSidetree } from '../services/sidetree';

const withMetaMask = (WrappedComponent) => {
  // eslint-disable-next-line
  const HOC = class extends Component {
    state = {
      sidetree: undefined,
    };

    async componentWillMount() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
        } catch (error) {
          console.log(error);
        }
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      }
      const sidetree = await initSidetree();

      this.setState({
        sidetree,
      });

      if (!sidetree && this.props.match.path !== '/dapp/info') {
        // eslint-disable-next-line
        alert('MetaMask is required to use this demo, please use the LATEST VERSION.');
        this.props.history.push('/dapp/info');
      }
    }

    render() {
      const { sidetree } = this.state;

      if (sidetree) {
        return <WrappedComponent {...this.props} sidetree={sidetree} />;
      }
      return <div />;
    }
  };

  return withRouter(HOC);
};

export default withMetaMask;
