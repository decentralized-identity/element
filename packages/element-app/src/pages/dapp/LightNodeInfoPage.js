import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import lightNode from '../../redux/lightNode';
import withMetaMask from '../../utils/withMetaMask';
import { BrowserNodeInfoPage } from '../../components/Pages/BrowserNodeInfoPage';

class LightNodeInfoPage extends Component {
  render() {
    return <BrowserNodeInfoPage {...this.props} />;
  }
}

const ConnectedPage = compose(
  withMetaMask,
  withRouter,
  lightNode.container,
)(LightNodeInfoPage);

export { ConnectedPage as LightNodeInfoPage };

export default ConnectedPage;
