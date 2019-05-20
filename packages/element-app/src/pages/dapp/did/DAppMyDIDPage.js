import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import {
  LinearProgress,
  //   Typography,
  //   ExpansionPanel,
  //   ExpansionPanelSummary,
  //   ExpansionPanelDetails,
} from '@material-ui/core';

// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Pages } from '../../../components/index';

import wallet from '../../../redux/wallet';
import ligthNode from '../../../redux/lightNode';

// import { DIDDocument } from '../../../components/DIDDocument';
// import { SidetreeTransaction } from '../../../components/SidetreeTransaction';

class DAppMyDIDPage extends Component {
  componentWillMount() {
    this.props.getAll();
  }

  render() {
    const { tree } = this.props.lightNode;
    return (
      <Pages.WithNavigation>
        {!tree ? <LinearProgress color="primary" variant="query" /> : <div>YOLO</div>}
      </Pages.WithNavigation>
    );
  }
}

DAppMyDIDPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  getAll: PropTypes.func.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  wallet.container,
  ligthNode.container,
)(DAppMyDIDPage);

export { ConnectedPage as DAppMyDIDPage };

export default ConnectedPage;
