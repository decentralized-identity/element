import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Paper, Typography, Button } from '@material-ui/core';

import element from '@transmute/element-lib';

import config from '../../config';

import { ExpansionPanelList } from '../index';

import { history } from '../../redux/store';

class Sidetree extends Component {
  state = {};

  async componentWillMount() {
    // console.log(anchorContractAddress);
    const blockchain = element.blockchain.ethereum.configure({
      anchorContractAddress: config.ELEMENT_CONTRACT_ADDRESS,
    });

    if (!this.props.wallet.data || !this.props.wallet.data.keys) {
      //   eslint-disable-next-line
      alert('You must create and unlock a wallet to test sidetree.');
      history.push('/wallet');
    }

    await blockchain.resolving;

    this.setState({
      contract: blockchain.anchorContractAddress,
    });

    const storage = element.storage.ipfs.configure({
      multiaddr: config.ELEMENT_IPFS_MULTIADDR,
    });

    this.blockchain = blockchain;
    this.storage = storage;

    const model = await element.func.syncFromBlockNumber({
      transactionTime: 0,
      initialState: {},
      reducer: element.reducer,
      storage: this.storage,
      blockchain: this.blockchain,
    });
    this.setState({
      model,
    });
  }

  newCreateOp = async () => {
    const keypair = Object.values(this.props.wallet.data.keys)[0];
    const payload = {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '#key1',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: keypair.publicKey,
        },
      ],
      service: [
        {
          id: '#transmute.element.light-node',
          type: 'Transmute.Element.LightNode',
          serviceEndpoint: `${window.location.href}#${Math.random()}`,
        },
      ],
    };
    const operation = await element.func.payloadToOperation({
      type: 'create',
      kid: '#key1',
      payload,
      privateKey: keypair.privateKey,
    });

    this.setState({
      operations: {
        ...(this.state.operations || {}),
        [operation]: {
          payload,
          type: 'create',
        },
      },
    });
  };

  anchorOperations = async () => {
    const tx = await element.func.operationsToTransaction({
      operations: Object.keys(this.state.operations),
      storage: this.storage,
      blockchain: this.blockchain,
    });
    this.setState({
      lastTx: tx,
      operations: undefined,
    });
    element.func
      .syncFromBlockNumber({
        transactionTime: 0,
        initialState: {},
        reducer: element.reducer,
        storage: this.storage,
        blockchain: this.blockchain,
      })
      .then((model) => {
        this.setState({
          model,
        });
      });
  };

  render() {
    return (
      <Paper className="Sidetree" style={{ padding: '8px' }}>
        <Typography variant={'h5'}>Sidetree</Typography>
        <Typography>Anchor Contract: {this.state.contract}</Typography>
        {this.state.operations && (
          <ExpansionPanelList
            panels={Object.values(this.state.operations).map(op => ({
              title: `${op.type} ${op.payload.service[0].serviceEndpoint}`,
              children: <Typography>{JSON.stringify(op.payload, null, 2)}</Typography>,
            }))}
          />
        )}

        <br />

        <Button variant={'contained'} onClick={this.newCreateOp}>
          Create
        </Button>
        <Button disabled={!this.state.operations} onClick={this.anchorOperations}>
          Anchor
        </Button>

        <br />
        <br />

        {this.state.model && Object.keys(this.state.model).length !== 0 && (
          <Typography variant={'h6'}>Try resolving these:</Typography>
        )}

        {this.state.model
          && Object.values(this.state.model)
            .filter(r => r.doc)
            .map(record => (
              <Typography key={record.doc.id} variant={'body2'}>
                {record.doc.id}
              </Typography>
            ))}
      </Paper>
    );
  }
}

Sidetree.propTypes = {
  wallet: PropTypes.object.isRequired,
};

export default Sidetree;
