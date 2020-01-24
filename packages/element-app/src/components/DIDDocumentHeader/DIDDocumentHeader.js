import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import DisplayQRCodeDialog from './DisplayQRCodeDialog';

// eslint-disable-next-line
const styles = theme => ({});

class DIDDocumentHeader extends Component {
  state = {
    anchorEl: null,
    isDisplayQrCodeDialogOpen: false,
  };

  render() {
    const { did, onCopyToClipboard } = this.props;

    const { anchorEl, isDisplayQrCodeDialogOpen } = this.state;

    return (
      <React.Fragment>
        <Paper style={{ width: '100%', wordBreak: 'break-all' }}>
          <DisplayQRCodeDialog
            did={did}
            open={isDisplayQrCodeDialogOpen}
            onClose={() => {
              this.setState({
                isDisplayQrCodeDialogOpen: false,
              });
            }}
          />
          <List>
            <ListItem>
              <Avatar style={{ marginRight: '8px' }}>
                <VerifiedUser />
              </Avatar>
              <ListItemText primary={did} />
              <ListItemSecondaryAction>
                <React.Fragment>
                  <IconButton
                    aria-label="did menu"
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    variant="contained"
                    onClick={event => {
                      this.setState({
                        anchorEl: event.currentTarget,
                      });
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="simple-menu"
                    keepMounted
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => {
                      this.setState({
                        anchorEl: null,
                      });
                    }}
                  >
                    <CopyToClipboard
                      text={did}
                      key={'did'}
                      onCopy={() => {
                        onCopyToClipboard();
                        this.setState({
                          anchorEl: null,
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <MenuItem>Copy DID to Clipboard</MenuItem>
                    </CopyToClipboard>

                    <MenuItem
                      onClick={() => {
                        this.setState({
                          isDisplayQrCodeDialogOpen: true,
                          isMenuOpen: false,
                        });
                      }}
                    >
                      Display DID as QR Code
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
      </React.Fragment>
    );
  }
}

DIDDocumentHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  did: PropTypes.string.isRequired,
  onCopyToClipboard: PropTypes.func.isRequired,
};

const MaterialUIDIDDocument = withStyles(styles)(DIDDocumentHeader);

export { MaterialUIDIDDocument as DIDDocumentHeader };

export default MaterialUIDIDDocument;
