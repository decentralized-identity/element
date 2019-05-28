import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import { Typography, Grid, Button } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

// eslint-disable-next-line
import 'brace/mode/json';
// eslint-disable-next-line
import 'brace/theme/github';

import { Pages } from '../../../components/index';

import wallet from '../../../redux/wallet';
import fullNode from '../../../redux/fullNode';

import { DIDDocument } from '../../../components/DIDDocument';

import { CreateDefaultDID } from '../../../components/CreateDefaultDID';
import { DIDDocumentEditorBar } from '../../../components/DIDDocumentEditorBar';

const SWAGGER_UI = window.location.hostname === 'element-did.com'
  ? 'https://element-did.com/api/docs'
  : 'http://localhost:5002/element-did/us-central1/main/docs';

class FullNodeMyDIDPage extends Component {
  async componentDidMount() {
    if (!this.props.wallet.data || !this.props.wallet.data.keys) {
      //   eslint-disable-next-line
      alert('You must create and unlock a wallet to test sidetree.');
      this.props.history.push('/wallet');
    }
    this.props.getDefaultDID(this.props.wallet);
    this.props.getNodeInfo();
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.predictedDefaultDID) {
  //     this.props.resolveDID(nextProps.predictedDefaultDID);
  //   }
  // }

  render() {
    const {
      fullNode,
      wallet,
      createDefaultDID,
      snackbarMessage,
      addKeyToDIDDocument,
      removeKeyFromDIDDocument,
    } = this.props;
    const { resolvedDefaultDID, resolving, predictedDefaultDID } = fullNode;

    const view = () => {
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
            <Button variant={'contained'} size={'small'} href={SWAGGER_UI}>
              Swagger API Docs
            </Button>
          </Grid>
          {this.props.fullNode.nodeInfo && (
            <Grid item xs={12}>
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Node Info</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <AceEditor
                    mode="json"
                    theme="github"
                    style={{ width: '100%' }}
                    name="jsonEditor"
                    value={JSON.stringify(this.props.fullNode.nodeInfo, null, 2)}
                    editorProps={{ $blockScrolling: true }}
                  />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Grid>
          )}
          <Grid item xs={12}>
            {view()}
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

FullNodeMyDIDPage.propTypes = {
  wallet: PropTypes.object.isRequired,
  fullNode: PropTypes.object.isRequired,
  getDefaultDID: PropTypes.func.isRequired,
  getNodeInfo: PropTypes.func.isRequired,
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
  fullNode.container,
)(FullNodeMyDIDPage);

export { ConnectedPage as FullNodeMyDIDPage };

export default ConnectedPage;
