import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import ligthNode from '../../redux/lightNode';

import { DIDListPage } from '../../components/Pages/DIDListPage';
import withMetaMask from '../../utils/withMetaMask';

class LightNodeDIDListPage extends Component {
  render() {
    return <DIDListPage {...this.props} nodeStore={this.props.lightNode} />;
  }
}

LightNodeDIDListPage.propTypes = {
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
)(LightNodeDIDListPage);

export { ConnectedPage as LightNodeDIDListPage };

export default ConnectedPage;
