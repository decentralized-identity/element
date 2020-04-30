import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

export class EditDocumentDialog extends React.Component {
  state = {
    newDidDocument: {},
  };

  handleClose = () => {
    this.props.onClose();
  };

  onChange = newValue => {
    try {
      this.setState({
        newDidDocument: JSON.parse(newValue),
      });
    } catch {
      console.log('invalid json value');
    }
  };

  render() {
    const { open, didDocument } = this.props;
    return (
      <Dialog
        fullWidth
        open={open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
        maxWidth={'md'}
      >
        <DialogTitle id="form-dialog-title">Edit DID Document</DialogTitle>
        <DialogContent style={{ minHeight: '200px' }}>
          <AceEditor
            editorProps={{
              $blockScrolling: Infinity,
            }}
            mode="json"
            theme="github"
            style={{ width: '100%' }}
            onLoad={() => {}}
            onChange={this.onChange}
            fontSize={12}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            defaultValue={JSON.stringify(didDocument, null, 2)}
            value={JSON.stringify(this.state.newDidDocument, null, 2)}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.props.onSubmit(this.state.newDidDocument);
            }}
            color="primary"
            variant="contained"
          >
            Submit changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

EditDocumentDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  didDocument: PropTypes.object,
};

export default EditDocumentDialog;
