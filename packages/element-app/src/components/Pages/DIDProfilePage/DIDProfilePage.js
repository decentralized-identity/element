import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Typography, Grid, LinearProgress } from '@material-ui/core';
import { Pages } from '../../index';

import { DIDDocument } from '../../DIDDocument';

import { CreateDefaultDID } from '../../CreateDefaultDID';
import { DIDDocumentEditorBar } from '../../DIDDocumentEditorBar';
import { SidetreeOperation } from '../../SidetreeOperation';

export class DIDProfilePage extends Component {
  componentWillMount() {
    if (!this.props.wallet.data || !this.props.wallet.data.keys) {
      //   eslint-disable-next-line
      alert('You must create and unlock a wallet to test sidetree.');
      this.props.history.push('/wallet');
    } else {
      this.props.predictDID(this.props.wallet);
    }
  }

  render() {
    const {
      nodeStore,
      wallet,
      createDID,
      snackbarMessage,
      addKeyToDIDDocument,
      removeKeyFromDIDDocument,
    } = this.props;
    const {
      myDidDocument, resolving, predictedDID, sidetreeOperations,
    } = nodeStore;

    const view = () => {
      if (!this.props.wallet.data || !this.props.wallet.data.keys) {
        return <LinearProgress color="primary" variant="query" />;
      }
      if (myDidDocument) {
        return (
          <React.Fragment>
            <Grid item xs={12}>
              <Typography variant="h5">My DID Document</Typography>
              <br />
            </Grid>

            <Grid item xs={12}>
              <DIDDocument
                didDocument={myDidDocument}
                editor={
                  <DIDDocumentEditorBar
                    didDocument={myDidDocument}
                    keys={wallet.data.keys}
                    handleAddKey={addKeyToDIDDocument}
                    handleRemoveKey={removeKeyFromDIDDocument}
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
            </Grid>
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          <Typography variant="h6">Your DID will be:</Typography>
          <br />
          <Typography variant="h5">{predictedDID}</Typography>

          <br />
          <CreateDefaultDID createDID={createDID} wallet={wallet} resolving={resolving} />
        </React.Fragment>
      );
    };

    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {view()}
          </Grid>
          {sidetreeOperations && sidetreeOperations.length && (
            <React.Fragment>
              <Grid item xs={12}>
                <Typography variant="h5">My Operations</Typography>
              </Grid>
              {sidetreeOperations.map(op => (
                <Grid item xs={12} key={op.operation.operationHash}>
                  <SidetreeOperation operation={op} expanded={false} />
                </Grid>
              ))}
            </React.Fragment>
          )}
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

DIDProfilePage.propTypes = {
  wallet: PropTypes.object.isRequired,
  nodeStore: PropTypes.object.isRequired,
  predictDID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  createDID: PropTypes.func.isRequired,
  getOperationsForDidUniqueSuffix: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  addKeyToDIDDocument: PropTypes.func.isRequired,
  removeKeyFromDIDDocument: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
};

export default DIDProfilePage;
