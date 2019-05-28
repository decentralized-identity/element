import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';
import { DIDResolver, Pages } from '../../../components/index';

import wallet from '../../../redux/wallet';
import fullNode from '../../../redux/fullNode';

class FullNodeResolverPage extends Component {
  render() {
    return (
      <Pages.WithNavigation>
        <DIDResolver
          did={this.props.match.params.did}
          resolveDID={this.props.resolveDID}
          store={this.props.fullNode}
        />
      </Pages.WithNavigation>
    );
  }
}

FullNodeResolverPage.propTypes = {
  fullNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

const ConnectedDAppDIDResolverPage = compose(
  withRouter,
  wallet.container,
  fullNode.container,
)(FullNodeResolverPage);

export { ConnectedDAppDIDResolverPage as FullNodeResolverPage };

export default ConnectedDAppDIDResolverPage;
