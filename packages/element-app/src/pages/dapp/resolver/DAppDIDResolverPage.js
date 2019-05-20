import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';
import { DIDResolver, Pages } from '../../../components/index';

import wallet from '../../../redux/wallet';
import ligthNode from '../../../redux/lightNode';

class DAppDIDResolverPage extends Component {
  render() {
    return (
      <Pages.WithNavigation>
        <DIDResolver
          did={this.props.match.params.did}
          resolveDID={this.props.resolveDID}
          store={this.props.lightNode}
        />
      </Pages.WithNavigation>
    );
  }
}

DAppDIDResolverPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

const ConnectedDAppDIDResolverPage = compose(
  withRouter,
  wallet.container,
  ligthNode.container,
)(DAppDIDResolverPage);

export { ConnectedDAppDIDResolverPage as DAppDIDResolverPage };

export default ConnectedDAppDIDResolverPage;
