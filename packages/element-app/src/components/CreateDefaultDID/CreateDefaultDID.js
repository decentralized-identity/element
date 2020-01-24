import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import Loading from '../Loading/Loading';

export class CreateDefaultDID extends Component {
  handleCreate = () => {
    this.props.createDID();
  };

  render() {
    const { resolving } = this.props;

    if (resolving) {
      return (
        <div style={{ marginTop: '15%' }}>
          <Loading message={'Resolving...'} />
        </div>
      );
    }

    return (
      <React.Fragment>
        <Button
          disabled={resolving}
          onClick={this.handleCreate}
          variant={'contained'}
          color={'secondary'}
        >
          Create DID
        </Button>
      </React.Fragment>
    );
  }
}

CreateDefaultDID.propTypes = {
  createDID: PropTypes.func.isRequired,
  resolving: PropTypes.any.isRequired,
};
