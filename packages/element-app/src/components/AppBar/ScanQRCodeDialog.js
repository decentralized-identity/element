import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import QrReader from 'react-qr-reader';

import { history } from '../../redux/store';

class ScanQRCodeDialog extends React.Component {
  state = {
    scannedDID: '',
  };

  handleClose = () => {
    this.props.onClose();
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.onClose();
    history.push(`/server/resolver/${this.state.scannedDID}`);
  };

  render() {
    return (
      <div>
        <Dialog
          fullScreen
          open={this.props.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Scan QR Code</DialogTitle>
          <DialogContent>
            <Grid container>
              <Grid item xs={4}>
                <QrReader
                  delay={300}
                  onScan={data => {
                    if (data && data.indexOf('did:elem:') !== -1) {
                      this.setState({
                        scannedDID: `did:${data.split('did:').pop()}`,
                      });
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2" style={{ margin: '16px' }}>
                  {this.state.scannedDID === ''
                    ? 'No Results'
                    : this.state.scannedDID}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Cancel</Button>
            <Button
              onClick={this.handleSubmit}
              color="primary"
              variant="contained"
            >
              Resolve
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ScanQRCodeDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ScanQRCodeDialog;
