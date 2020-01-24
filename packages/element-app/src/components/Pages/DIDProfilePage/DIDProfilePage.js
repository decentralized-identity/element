import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Pages } from '../../index';

import { DIDDocument } from '../../DIDDocument';

import { Loading } from '../../Loading/Loading';

import { CreateDefaultDID } from '../../CreateDefaultDID';
import { DIDDocumentEditorBar } from '../../DIDDocumentEditorBar';
import { SidetreeOperation } from '../../SidetreeOperation';

export class DIDProfilePage extends Component {
  componentDidMount() {
    if (
      !this.props.keystore.keystore ||
      !this.props.keystore.keystore.data ||
      !this.props.keystore.keystore.data.keys
    ) {
      //   eslint-disable-next-line
      alert('You must create and unlock a keystore to test sidetree.');
      this.props.history.push('/keystore');
    } else {
      this.props.predictDID(this.props.keystore);
    }
  }

  render() {
    const {
      nodeStore,
      keystore,
      createDID,

      addKeyToDIDDocument,
      removeKeyFromDIDDocument,
    } = this.props;
    const {
      myDidDocument,
      resolving,
      predictedDID,
      sidetreeOperations,
    } = nodeStore;

    const view = () => {
      if (resolving) {
        return (
          <div style={{ marginTop: '15%' }}>
            <Loading message={'Resolving...'} />
          </div>
        );
      }
      if (myDidDocument) {
        return (
          <React.Fragment>
            <Grid item xs={12}>
              <Typography variant="h6">My DID</Typography>
              <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
                Use this page to manage your DID.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <DIDDocument
                didDocument={myDidDocument}
                editor={
                  <DIDDocumentEditorBar
                    didDocument={myDidDocument}
                    keys={this.props.keystore.keystore.data.keys}
                    handleAddKey={addKeyToDIDDocument}
                    handleRemoveKey={removeKeyFromDIDDocument}
                  />
                }
                onCopyToClipboard={() => {
                  this.props.doSetTmuiProp({
                    snackBarMessage: {
                      open: true,
                      variant: 'success',
                      message: 'Copied to clipboard.',
                      vertical: 'top',
                      horizontal: 'right',
                      autoHideDuration: 5000,
                    },
                  });
                }}
              />

              {sidetreeOperations && sidetreeOperations.length > 0 && (
                <React.Fragment>
                  <Grid
                    item
                    xs={12}
                    style={{ marginTop: '40px', marginBottom: '4px' }}
                  >
                    <Typography variant="h6">Operations</Typography>
                    <br />
                  </Grid>
                  {sidetreeOperations
                    .sort((a, b) => {
                      return a.transaction.transactionNumber <=
                        b.transaction.transactionNumber
                        ? 1
                        : -1;
                    })
                    .map(op => (
                      <Grid
                        item
                        xs={12}
                        key={op.transaction.transactionNumber}
                        style={{ marginBottom: '8px' }}
                      >
                        <SidetreeOperation operation={op} expanded={false} />
                      </Grid>
                    ))}
                </React.Fragment>
              )}
            </Grid>
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          <Typography variant="h6">Your DID will be:</Typography>
          <br />
          <Typography variant="subtitle1">{predictedDID}</Typography>
          <br />
          <CreateDefaultDID
            createDID={createDID}
            keystore={keystore}
            resolving={resolving}
          />
        </React.Fragment>
      );
    };

    return (
      <Pages.WithNavigation>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {view()}
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

DIDProfilePage.propTypes = {
  keystore: PropTypes.object.isRequired,
  nodeStore: PropTypes.object.isRequired,
  predictDID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  createDID: PropTypes.func.isRequired,
  doSetTmuiProp: PropTypes.func.isRequired,
  addKeyToDIDDocument: PropTypes.func.isRequired,
  removeKeyFromDIDDocument: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
};

export default DIDProfilePage;
