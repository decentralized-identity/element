import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import fullNode from '../../redux/fullNode';

import { DIDListPage } from '../../components/Pages/DIDListPage';

class FullNodeDIDListPage extends Component {
  render() {
    return <DIDListPage {...this.props} nodeStore={this.props.fullNode} />;
  }
}

FullNodeDIDListPage.propTypes = {
  fullNode: PropTypes.object.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  fullNode.container,
)(FullNodeDIDListPage);

export { ConnectedPage as FullNodeDIDListPage };

export default ConnectedPage;
