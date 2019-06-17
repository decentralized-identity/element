import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import fullNode from '../../../redux/fullNode';

import { DIDListPage } from '../../../components/Pages/DIDListPage';

class FullNodeDIDListPage extends Component {
  render() {
    return <DIDListPage />;
  }
}

const ConnectedPage = compose(
  withRouter,
  fullNode.container,
)(FullNodeDIDListPage);

export { ConnectedPage as FullNodeDIDListPage };

export default ConnectedPage;
