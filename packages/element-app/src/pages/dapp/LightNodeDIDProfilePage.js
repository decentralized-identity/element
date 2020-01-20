import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';
import withMetaMask from '../../utils/withMetaMask';

import ligthNode from '../../redux/lightNode';

import { DIDProfilePage } from '../../components/Pages/DIDProfilePage';

class LightNodeDIDProfilePage extends Component {
  render() {
    return <DIDProfilePage {...this.props} nodeStore={this.props.lightNode} />;
  }
}

LightNodeDIDProfilePage.propTypes = {
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
  ligthNode.container
)(LightNodeDIDProfilePage);

export { ConnectedPage as LightNodeDIDProfilePage };

export default ConnectedPage;
