import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Typography, LinearProgress } from '@material-ui/core';

import { Pages } from '../../index';

import { DIDListItem } from '../../DIDListItem';

export class DIDListPage extends Component {
  componentWillMount() {
    this.props.getAll();
  }

  render() {
    const { resolving, documentRecords } = this.props.nodeStore;
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

DIDListPage.propTypes = {
  nodeStore: PropTypes.object.isRequired,
  resolveDID: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
  getAll: PropTypes.func.isRequired,
};

export default DIDListPage;
