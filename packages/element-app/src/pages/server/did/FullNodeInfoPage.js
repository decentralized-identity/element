import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import fullNode from '../../../redux/fullNode';

import { ServerNodeInfoPage } from '../../../components/Pages/ServerNodeInfoPage';

class FullNodeInfoPage extends Component {
  render() {
    return <ServerNodeInfoPage {...this.props} />;
  }
}

const ConnectedPage = compose(
  withRouter,
  fullNode.container,
)(FullNodeInfoPage);

export { ConnectedPage as FullNodeInfoPage };

export default ConnectedPage;
