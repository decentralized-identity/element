import React, { Component } from 'react';

import { Typography, Button } from '@material-ui/core';

import { Pages, ParticlesContainer } from '../../../components/index';

import './NotFound.css';

export class NotFound extends Component {
  render() {
    return (
      <Pages.Default className="notFound">
        <ParticlesContainer >
          <div className="copy" style={{ padding: '32px' }}>
            <Typography variant="h1">404</Typography>
            <Typography variant="h4">{window.location.pathname} page not found.</Typography>
            <br />
            <Button
              variant="contained"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go Home
            </Button>
          </div>
        </ParticlesContainer>
      </Pages.Default>
    );
  }
}

export default NotFound;
