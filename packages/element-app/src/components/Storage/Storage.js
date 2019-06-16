import React, { Component } from 'react';

import { Paper, Typography } from '@material-ui/core';

import { sidetree } from '../../services/sidetree';

export class Storage extends Component {
  state = {};

  async componentWillMount() {
    const info = await sidetree.storage.ipfs.version();
    this.setState({
      info,
    });
  }

  render() {
    const { info } = this.state;

    return (
      <Paper className="Storage" style={{ padding: '8px', wordBreak: 'break-all' }}>
        <Typography variant={'h5'}>IPFS</Typography>
        {info === undefined ? (
          <Typography variant={'h6'}>Loading...</Typography>
        ) : (
          <div>
            <Typography>Version: {info.version}</Typography>
            <Typography>Repo: {info.repo}</Typography>
          </div>
        )}
      </Paper>
    );
  }
}

export default Storage;
