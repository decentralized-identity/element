import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

// eslint-disable-next-line
import 'brace/mode/json';
// eslint-disable-next-line
import 'brace/theme/github';

import element from '@transmute/element-lib';

export class AddKeyDialog extends React.Component {
  state = {
    jsonEditorValue: '',
    open: false,
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = () => {
    const { jsonEditorValue } = this.state;
    const parsedKey = JSON.parse(jsonEditorValue);
    this.props.onSubmit(parsedKey);
  };

  componentWillReceiveProps(nextProps) {
    const keys = element.func.createKeys();
    const payload = {
      type: 'assymetric',
      encoding: 'hex',
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      tags: ['Secp256k1VerificationKey2018', 'WebBrowser'],
      notes: '',
    };
    this.setState({
      open: nextProps.open,
      jsonEditorValue: JSON.stringify(payload, null, 2),
    });
  }

  render() {
    const { jsonEditorValue } = this.state;
    return (
      <Dialog
        fullWidth
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add Key</DialogTitle>
        <DialogContent>
          <AceEditor
            mode="json"
            theme="github"
            style={{ width: '100%' }}
            disabled
            name="signatureEditor"
            value={jsonEditorValue}
            onChange={(newValue) => {
              // console.log('change', newValue);
              this.setState({
                jsonEditorValue: newValue,
              });
            }}
            editorProps={{ $blockScrolling: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="primary" variant="contained">
            Add Key
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddKeyDialog.propTypes = {
  open: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

export default AddKeyDialog;
