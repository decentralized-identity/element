import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import QrReader from 'react-qr-reader';

class ScanQRCodeDialog extends React.Component {
  state = {
    open: false,
  };

  handleClose = () => {
    this.props.onClose();
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
    });
  }

  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  };

  handleError = (err) => {
    console.error(err);
  };

  handleScan = (data) => {
    if (data) {
      console.log('scanned: ', data);
      this.props.onScan(data);
      this.handleClose();
    }
  };

  render() {
    return (
      <div>
        <Dialog
          fullWidth
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Scan QR Code</DialogTitle>
          <DialogContent>
            <QrReader
              delay={500}
              resolution={1000}
              onError={this.handleError}
              onScan={this.handleScan}
              style={{ width: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ScanQRCodeDialog.propTypes = {
  open: PropTypes.bool,
  onScan: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ScanQRCodeDialog;
