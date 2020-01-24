import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DialogTitle from '@material-ui/core/DialogTitle';

import Box from '@material-ui/core/Box';

import QRCode from 'qrcode.react';

class DisplayQRCodeDialog extends React.Component {
  handleClose = () => {
    this.props.onClose();
  };

  render() {
    const { did } = this.props;
    return (
      <div>
        <Dialog
          fullScreen
          open={this.props.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Scan DID</DialogTitle>
          <DialogContent>
            <Box display={{ xs: 'block', sm: 'none' }}>
              <QRCode value={did} style={{ width: '256px', height: '256px' }} />
            </Box>
            <Box display={{ xs: 'none', sm: 'block' }}>
              <QRCode value={did} style={{ width: '512px', height: '512px' }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DisplayQRCodeDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  did: PropTypes.string,
};

export default DisplayQRCodeDialog;
