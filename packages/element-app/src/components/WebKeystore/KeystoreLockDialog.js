import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class KeystoreLockDialog extends React.Component {
  state = {
    password: '',
  };

  handleClose = () => {
    this.setState({ password: '' });
    this.props.onClose();
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.doToggleKeystore(this.state.password);
    this.setState({ password: '' });
  };

  render() {
    const { password } = this.state;
    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Enter Keystore Password
          </DialogTitle>
          <DialogContent>
            <DialogContentText>{this.props.message}</DialogContentText>
            <form onSubmit={this.handleSubmit}>
              <TextField
                autoFocus
                margin="dense"
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={this.handleChange('password')}
                fullWidth
              />
            </form>
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
              {this.props.keystoreState === 'locked' ? 'Unlock' : 'Lock'}{' '}
              Keystore
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

KeystoreLockDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  keystoreState: PropTypes.string.isRequired,
};

export default KeystoreLockDialog;
