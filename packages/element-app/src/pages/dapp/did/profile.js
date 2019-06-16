import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import { Typography, Grid, LinearProgress } from '@material-ui/core';
import { Pages } from '../../../components/index';

import wallet from '../../../redux/wallet';
import ligthNode from '../../../redux/lightNode';

import { DIDDocument } from '../../../components/DIDDocument';

import { CreateDefaultDID } from '../../../components/CreateDefaultDID';
import { DIDDocumentEditorBar } from '../../../components/DIDDocumentEditorBar';

class LightNodeMyDIDPage extends Component {
  componentWillMount() {
    if (!this.props.wallet.data || !this.props.wallet.data.keys) {
      //   eslint-disable-next-line
      alert('You must create and unlock a wallet to test sidetree.');
      this.props.history.push('/wallet');
    } else {
      this.props.getDefaultDID(this.props.wallet);
    }
  }

  render() {
    const {
      lightNode,
      wallet,
      createDefaultDID,
      snackbarMessage,
      addKeyToDIDDocument,
      removeKeyFromDIDDocument,
    } = this.props;
    const { resolvedDefaultDID, resolving, predictedDefaultDID } = lightNode;

    const view = () => {
      if (!this.props.wallet.data || !this.props.wallet.data.keys) {
        return <LinearProgress color="primary" variant="query" />;
      }
      if (resolvedDefaultDID) {
        return (
          <DIDDocument
            didDocument={resolvedDefaultDID}
            editor={
              <DIDDocumentEditorBar
                didDocument={resolvedDefaultDID}
                keys={wallet.data.keys}
                handleAddKey={(key) => {
                  addKeyToDIDDocument(wallet, key);
                }}
                handleRemoveKey={(key) => {
                  removeKeyFromDIDDocument(wallet, key);
                }}
              />
            }
            onCopyToClipboard={() => {
              snackbarMessage({
                snackbarMessage: {
                  message: 'Copied to clipboard.',
                  variant: 'success',
                  open: true,
                },
              });
            }}
          />
        );
      }

      return (
        <React.Fragment>
          <Typography variant="h5">Your DID will be: {predictedDefaultDID}</Typography>
          <Typography variant="h6">You have not created a default DID yet.</Typography>
          <br />
          <CreateDefaultDID
            createDefaultDID={createDefaultDID}
            wallet={wallet}
            resolving={resolving}
          />
        </React.Fragment>
      );
    };

    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {view()}
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

LightNodeMyDIDPage.propTypes = {
  wallet: PropTypes.object.isRequired,
  lightNode: PropTypes.object.isRequired,
  getDefaultDID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  createDefaultDID: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  addKeyToDIDDocument: PropTypes.func.isRequired,
  removeKeyFromDIDDocument: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
};

const ConnectedPage = compose(
  withRouter,
  wallet.container,
  ligthNode.container,
)(LightNodeMyDIDPage);

export { ConnectedPage as LightNodeMyDIDPage };

export default ConnectedPage;
