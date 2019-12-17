import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { AddKeyDialog } from './AddKeyDialog';
import { RemoveKeyDialog } from './RemoveKeyDialog';

const styles = () => ({
  title: {
    flexGrow: 1,
    color: 'white',
  },
});

class DIDDocumentEditorBar extends Component {
  state = {
    isAddKeyDialogOpen: false,
    isRemoveKeyDialogOpen: false,
  };

  handleAddKey = (item) => {
    const { publicKey, tags } = item.value;
    const kid = tags[1];
    this.props.handleAddKey(kid, publicKey);
    this.setState({
      isAddKeyDialogOpen: false,
      isRemoveKeyDialogOpen: false,
    });
  };

  // TODO prevent removing recovery key
  handleRemoveKey = (item) => {
    this.props.handleRemoveKey(item.value);
    this.setState({
      isAddKeyDialogOpen: false,
      isRemoveKeyDialogOpen: false,
    });
  };

  onlyNewKeys = () => {
    const { didDocument, keys } = this.props;
    const didDocumentPublicKeys = didDocument.publicKey
      .map(key => key.publicKeyHex);
    const res = Object.values(keys)
      .filter(key => !didDocumentPublicKeys.includes(key.publicKey))
      .reduce((acc, key) => ({ ...acc, [key.kid]: key }), {});
    return res;
  };

  onlyExistingKeys = () => {
    const { didDocument, keys } = this.props;
    const walletPublicKeys = Object.values(keys)
      .map(key => key.publicKey);
    const res = didDocument.publicKey
      .filter(key => walletPublicKeys.includes(key.publicKeyHex))
      .reduce((acc, key) => ({ ...acc, [key.id]: key }), {});
    return res;
  };

  render() {
    // const { classes } = this.props;
    const { isAddKeyDialogOpen, isRemoveKeyDialogOpen } = this.state;
    return (
      <React.Fragment>
        <AppBar position="static" color="default">
          <Toolbar disableGutters={false}>
            <Grid container>
              <Grid item>
                <Button
                  color="primary"
                  // variant={'contained'}
                  onClick={() => {
                    this.setState({
                      isAddKeyDialogOpen: true,
                    });
                  }}
                >
                  Add Key
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  // variant={'contained'}
                  onClick={() => {
                    this.setState({
                      isRemoveKeyDialogOpen: true,
                    });
                  }}
                >
                  Remove Key
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <AddKeyDialog
          open={isAddKeyDialogOpen}
          keys={this.onlyNewKeys()}
          onClose={() => {
            this.setState({
              isAddKeyDialogOpen: false,
            });
          }}
          onSubmit={this.handleAddKey}
        />
        <RemoveKeyDialog
          open={isRemoveKeyDialogOpen}
          keys={this.onlyExistingKeys()}
          onClose={() => {
            this.setState({
              isRemoveKeyDialogOpen: false,
            });
          }}
          onSubmit={this.handleRemoveKey}
        />
      </React.Fragment>
    );
  }
}

DIDDocumentEditorBar.propTypes = {
  classes: PropTypes.object.isRequired,
  didDocument: PropTypes.object.isRequired,
  keys: PropTypes.object.isRequired,
  handleAddKey: PropTypes.func.isRequired,
  handleRemoveKey: PropTypes.func.isRequired,
};

const MaterialUIDIDDocument = withStyles(styles)(DIDDocumentEditorBar);

export { MaterialUIDIDDocument as DIDDocumentEditorBar };

export default MaterialUIDIDDocument;
