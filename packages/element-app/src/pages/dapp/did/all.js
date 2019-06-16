import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import { Typography, LinearProgress } from '@material-ui/core';

import { Pages } from '../../../components/index';

import wallet from '../../../redux/wallet';
import ligthNode from '../../../redux/lightNode';

import { DIDListItem } from '../../../components/DIDListItem';

class LightNodeViewAllDIDPage extends Component {
  componentWillMount() {
    this.props.getAll();
  }

  render() {
    const { resolving, documentRecords } = this.props.lightNode;
    return (
      <Pages.WithNavigation>
        {resolving || !documentRecords ? (
          <LinearProgress color="primary" variant="query" />
        ) : (
          <div>
            <Typography variant="h6">DID List</Typography>
            <br />
            <Typography variant="body1">{'Only displaying local data.'}</Typography>
            <br />

            {documentRecords.map(dr => (
              <div key={dr.record.doc.id} style={{ marginBottom: '8px' }}>
                <DIDListItem
                  record={dr.record}
                  onClick={(item) => {
                    this.props.history.push(`/dapp/transactions/${item.lastTransaction.transactionTimeHash}`);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Pages.WithNavigation>
    );
  }
}

LightNodeViewAllDIDPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
  getAll: PropTypes.func.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  wallet.container,
  ligthNode.container,
)(LightNodeViewAllDIDPage);

export { ConnectedPage as LightNodeViewAllDIDPage };

export default ConnectedPage;
