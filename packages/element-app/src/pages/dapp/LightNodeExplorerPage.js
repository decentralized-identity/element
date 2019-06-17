import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import ligthNode from '../../redux/lightNode';
import withMetaMask from '../../utils/withMetaMask';

import { ExplorerPage } from '../../components/Pages/ExplorerPage';

class LightNodeExplorerPage extends Component {
  render() {
    return <ExplorerPage {...this.props} nodeStore={this.props.lightNode} />;
  }
}

LightNodeExplorerPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
  getAll: PropTypes.func.isRequired,
};

const ConnectedPage = compose(
  withMetaMask,
  withRouter,
  ligthNode.container,
)(LightNodeExplorerPage);

export { ConnectedPage as LightNodeExplorerPage };

export default ConnectedPage;
