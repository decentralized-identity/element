import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import ligthNode from '../../redux/lightNode';
import withMetaMask from '../../utils/withMetaMask';

import { ExplorerTransactionPage } from '../../components/Pages/ExplorerTransactionPage';

class LightNodeExplorerTransactionPage extends Component {
  render() {
    return (
      <ExplorerTransactionPage
        {...this.props}
        nodeStore={this.props.lightNode}
      />
    );
  }
}

LightNodeExplorerTransactionPage.propTypes = {
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
)(LightNodeExplorerTransactionPage);

export { ConnectedPage as LightNodeExplorerTransactionPage };

export default ConnectedPage;
