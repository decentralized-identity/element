import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import ligthNode from '../../redux/fullNode';

import { ExplorerOperationsPage } from '../../components/Pages/ExplorerOperationsPage';

class FullNodeExplorerOperationsPage extends Component {
  render() {
    return (
      <ExplorerOperationsPage {...this.props} nodeStore={this.props.fullNode} />
    );
  }
}

FullNodeExplorerOperationsPage.propTypes = {
  fullNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
  getAll: PropTypes.func.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  ligthNode.container
)(FullNodeExplorerOperationsPage);

export { ConnectedPage as FullNodeExplorerOperationsPage };

export default ConnectedPage;
