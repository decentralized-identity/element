import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';
import { DIDResolver, Pages } from '../../components/index';

import ligthNode from '../../redux/lightNode';
import withMetaMask from '../../utils/withMetaMask';

class LightNodeDIDResolverPage extends Component {
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

LightNodeDIDResolverPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

const ConnectedLightNodeDIDResolverPage = compose(
  withMetaMask,
  withRouter,
  ligthNode.container,
)(LightNodeDIDResolverPage);

export { ConnectedLightNodeDIDResolverPage as LightNodeDIDResolverPage };

export default ConnectedLightNodeDIDResolverPage;
