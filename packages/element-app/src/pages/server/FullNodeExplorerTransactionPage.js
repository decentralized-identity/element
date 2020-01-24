import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import fullNode from '../../redux/fullNode';

import { ExplorerTransactionPage } from '../../components/Pages/ExplorerTransactionPage';

class FullNodeExplorerTransactionPage extends Component {
  render() {
    return (
      <ExplorerTransactionPage
        {...this.props}
        nodeStore={this.props.fullNode}
      />
    );
  }
}

FullNodeExplorerTransactionPage.propTypes = {
  fullNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  doSetTmuiProp: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
  getAll: PropTypes.func.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  fullNode.container
)(FullNodeExplorerTransactionPage);

export { ConnectedPage as FullNodeExplorerTransactionPage };

export default ConnectedPage;
