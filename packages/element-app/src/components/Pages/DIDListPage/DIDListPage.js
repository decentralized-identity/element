import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Loading from '../../Loading/Loading';

import { Pages } from '../../index';

import { DIDListItem } from '../../DIDListItem';

export class DIDListPage extends Component {
  componentWillMount() {
    this.props.getAll();
  }

  render() {
    const { resolving, documentRecords } = this.props.nodeStore;
    const prefix = this.props.fullNode ? '/server' : '/dapp';
    return (
      <Pages.WithNavigation>
        {resolving || !documentRecords ? (
          <div style={{ marginTop: '15%' }}>
            <Loading message={'Resolving...'} />
          </div>
        ) : (
          <div>
            <Typography variant="h6">DID List</Typography>
            <br />
            <Typography variant="body1">
              {
                'Only displaying DIDs that have been resolved at least once on this node'
              }
            </Typography>
            <br />

            {documentRecords.map(dr => (
              <div key={dr.record.doc.id} style={{ marginBottom: '8px' }}>
                <DIDListItem
                  record={dr.record}
                  onClick={item => {
                    this.props.history.push(
                      `${prefix}/operations/${item.doc.id.split(':').pop()}`
                    );
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

  match: PropTypes.object.isRequired,
  history: PropTypes.any.isRequired,
  getAll: PropTypes.func.isRequired,
  fullNode: PropTypes.object,
};

export default DIDListPage;
