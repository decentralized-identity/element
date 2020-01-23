import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import ligthNode from '../../redux/lightNode';
import withMetaMask from '../../utils/withMetaMask';

import { ExplorerOperationsPage } from '../../components/Pages/ExplorerOperationsPage';

class LightNodeExplorerOperationsPage extends Component {
  render() {
    return (
      <ExplorerOperationsPage
        {...this.props}
        nodeStore={this.props.lightNode}
      />
    );
  }
}

LightNodeExplorerOperationsPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  doSetTmuiProp: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
  getAll: PropTypes.func.isRequired,
};

const ConnectedPage = compose(
  withMetaMask,
  withRouter,
  ligthNode.container
)(LightNodeExplorerOperationsPage);

export { ConnectedPage as LightNodeExplorerOperationsPage };

export default ConnectedPage;
