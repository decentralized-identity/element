import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography } from '@material-ui/core';

import Ledger from './Ledger';
import Storage from './Storage';
import Sidetree from './Sidetree';

import { DIDResolver } from '../index';

class ElementLightNode extends Component {
  render() {
    const { wallet } = this.props;
    return (
      <div className="ElementLightNode">
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant={'h4'}>Sidetree Ethereum In Browser Light Node</Typography>
            <br />
            <Typography variant={'body1'}>
              On first load with metamask, you be asked to deploy a contract that will be used for
              the rest of the demo. You will need to clear local storage if you restart ganache.
              When testing with MetaMask, you may need to reset your account to fix the nonce issue
              reported{' '}
              <a href="https://ethereum.stackexchange.com/questions/30921/tx-doesnt-have-the-correct-nonce-metamask">
                here
              </a>
              .
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Ledger />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Storage />
          </Grid>
          <Grid item xs={12}>
            <Sidetree wallet={wallet} />
          </Grid>

          <Grid item xs={12}>
            <DIDResolver resolveDID={this.props.resolveDID} did={this.props.lightNode} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

ElementLightNode.propTypes = {
  wallet: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  lightNode: PropTypes.object.isRequired,
};

export default ElementLightNode;
