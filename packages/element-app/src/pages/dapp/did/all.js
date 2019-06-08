import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import { Typography, LinearProgress } from '@material-ui/core';

import { Pages } from '../../../components/index';

import wallet from '../../../redux/wallet';
import ligthNode from '../../../redux/lightNode';

import { ElementDIDWithTransactions } from '../../../components/ElementDIDWithTransactions';

class LightNodeViewAllDIDPage extends Component {
  componentWillMount() {
    this.props.getAll();
  }

  render() {
    const { tree } = this.props.lightNode;

    return (
      <Pages.WithNavigation>
        {!tree ? (
          <LinearProgress color="primary" variant="query" />
        ) : (
          <div>
            <Typography variant="h6">DID List</Typography>
            <br />

            {Object.values(tree).map(record => (!record.doc ? (
              undefined
            ) : (
                <div key={record.doc.id}>
                  <ElementDIDWithTransactions
                    record={record}
                    onCopyToClipboard={(item) => {
                      this.props.snackbarMessage({
                        snackbarMessage: {
                          message: `Copied : ${item.substring(0, 32)} ...`,
                          variant: 'success',
                          open: true,
                        },
                      });
                    }}
                  />
                </div>
            )))}
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
  getAll: PropTypes.func.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  wallet.container,
  ligthNode.container,
)(LightNodeViewAllDIDPage);

export { ConnectedPage as LightNodeViewAllDIDPage };

export default ConnectedPage;
