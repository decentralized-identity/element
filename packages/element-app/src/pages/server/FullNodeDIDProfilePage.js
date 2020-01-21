import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import fullNode from '../../redux/fullNode';

import { DIDProfilePage } from '../../components/Pages/DIDProfilePage';

class FullNodeDIDProfilePage extends Component {
  render() {
    return <DIDProfilePage {...this.props} nodeStore={this.props.fullNode} />;
  }
}

FullNodeDIDProfilePage.propTypes = {
  fullNode: PropTypes.object.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  fullNode.container
)(FullNodeDIDProfilePage);

export { ConnectedPage as FullNodeDIDProfilePage };

export default ConnectedPage;
