import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import fullNode from '../../redux/fullNode';

import { ExplorerPage } from '../../components/Pages/ExplorerPage';

class FullNodeExplorerPage extends Component {
  render() {
    return <ExplorerPage {...this.props} nodeStore={this.props.fullNode} />;
  }
}

FullNodeExplorerPage.propTypes = {
  fullNode: PropTypes.object.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  fullNode.container,
)(FullNodeExplorerPage);

export { ConnectedPage as FullNodeExplorerPage };

export default ConnectedPage;
