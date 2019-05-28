import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { LinearProgress, Button } from '@material-ui/core';

export class CreateDefaultDID extends Component {
  handleCreate = () => {
    this.props.createDefaultDID(this.props.wallet);
  };

  render() {
    const { resolving } = this.props;

    if (resolving) {
      return <LinearProgress color="primary" variant="query" />;
    }

    return (
      <React.Fragment>
        <Button
          disabled={resolving}
          onClick={this.handleCreate}
          variant={'contained'}
          color={'secondary'}
        >
          Create Default DID
        </Button>
      </React.Fragment>
    );
  }
}

CreateDefaultDID.propTypes = {
  wallet: PropTypes.object.isRequired,
  createDefaultDID: PropTypes.func.isRequired,
  resolving: PropTypes.any.isRequired,
};
