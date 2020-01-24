import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DialogTitle from '@material-ui/core/DialogTitle';

import KeystoreEditor from './KeystoreEditor';

class KeystoreEditorDialog extends React.Component {
  state = {
    isSetup: false,
    keystore: '{}',
  };

  componentDidUpdate() {
    if (
      !this.state.isSetup &&
      this.props.keystore &&
      typeof this.props.keystore.data === 'object'
    ) {
      const maybeNew = JSON.stringify(this.props.keystore.data.keys, null, 2);
      if (this.state.keystore !== maybeNew) {
        this.setState({
          keystore: maybeNew,
        });
        this.setState({
          isSetup: true,
        });
      }
    }
  }

  handleClose = () => {
    this.setState({
      isSetup: false,
    });
    this.props.onClose();
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.doUpdateKeystore(this.state.keystore);
    this.props.onClose();
  };

  render() {
    const { keystore } = this.state;
    return (
      <div>
        <Dialog
          fullScreen
          open={this.props.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Edit Keystore</DialogTitle>
          <DialogContent>
            <KeystoreEditor
              value={keystore}
              onChange={newValue => {
                this.setState({ keystore: newValue });
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={this.handleSubmit}
              color="primary"
              variant="contained"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

KeystoreEditorDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  keystore: PropTypes.object.isRequired,
  doUpdateKeystore: PropTypes.any.isRequired,
};

export default KeystoreEditorDialog;
