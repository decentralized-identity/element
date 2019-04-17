import React, { Component } from 'react';

import { Paper, Typography } from '@material-ui/core';

import element from '@transmute/element-lib';

import config from '../../config';

const storage = element.storage.ipfs.configure({
  multiaddr: config.ELEMENT_IPFS_MULTIADDR,
});

class Storage extends Component {
  state = {};

  async componentWillMount() {
    const info = await storage.ipfs.id();
    this.setState({
      info,
    });
  }

  render() {
    const { info } = this.state;

    return (
      <Paper className="Storage" style={{ padding: '8px', wordBreak: 'break-all' }}>
        <Typography variant={'h5'}>Storage</Typography>
        {info === undefined ? (
          <Typography variant={'h6'}>Loading...</Typography>
        ) : (
          <div>
            <Typography>ID: {info.id}</Typography>
            <Typography>Agent Version: {info.agentVersion}</Typography>
            <Typography>Protocol Version: {info.protocolVersion}</Typography>
          </div>
        )}
      </Paper>
    );
  }
}

export default Storage;
