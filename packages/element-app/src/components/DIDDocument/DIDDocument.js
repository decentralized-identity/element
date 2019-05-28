import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {
  Typography,
  List,
  ListItem,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import {
  FilterNone, DeviceHub, Fingerprint, VpnKey, Https,
} from '@material-ui/icons';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import QRCode from 'qrcode.react';

import { DIDDocumentHeader } from '../DIDDocumentHeader';

// eslint-disable-next-line
const styles = theme => ({
  didQRCode: {
    width: '128px',
    height: '128px',
    margin: '0 auto',
  },
});

class DIDDocument extends Component {
  render() {
    const {
      classes, didDocument, onCopyToClipboard, editor,
    } = this.props;

    return (
      <React.Fragment>
        <DIDDocumentHeader did={didDocument.id} onCopyToClipboard={onCopyToClipboard} />

        {!!editor && editor}

        <ExpansionPanel style={{ width: '100%' }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Scan QRCode DID</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <CopyToClipboard
              text={didDocument.id}
              key={'did'}
              onCopy={onCopyToClipboard}
              style={{ cursor: 'pointer' }}
            >
              <QRCode value={didDocument.id} className={classes.didQRCode} />
            </CopyToClipboard>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {didDocument.publicKey
          && didDocument.publicKey.map(publicKey => (
            <ExpansionPanel style={{ width: '100%' }} key={publicKey.id}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {publicKey.id} {publicKey.type}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <List style={{ width: '100%' }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Fingerprint />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      style={{ wordBreak: 'break-all', marginRight: '2px' }}
                      primary={'ID'}
                      secondary={publicKey.id}
                    />
                    <ListItemSecondaryAction>
                      <CopyToClipboard
                        text={publicKey.id}
                        key={publicKey.id}
                        onCopy={onCopyToClipboard}
                        style={{ cursor: 'pointer' }}
                      >
                        <IconButton aria-label="Copy">
                          <FilterNone />
                        </IconButton>
                      </CopyToClipboard>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <VpnKey />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      style={{ wordBreak: 'break-all', marginRight: '2px' }}
                      primary={'Key'}
                      secondary={publicKey.publicKeyHex}
                    />
                    <ListItemSecondaryAction>
                      <CopyToClipboard
                        text={publicKey.publicKeyHex}
                        key={publicKey.publicKeyHex}
                        onCopy={onCopyToClipboard}
                        style={{ cursor: 'pointer' }}
                      >
                        <IconButton aria-label="Copy">
                          <FilterNone />
                        </IconButton>
                      </CopyToClipboard>
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Https />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      style={{ wordBreak: 'break-all', marginRight: '2px' }}
                      primary={'Type'}
                      secondary={publicKey.type}
                    />
                    <ListItemSecondaryAction>
                      <CopyToClipboard
                        text={publicKey.type}
                        key={publicKey.type}
                        onCopy={onCopyToClipboard}
                        style={{ cursor: 'pointer' }}
                      >
                        <IconButton aria-label="Copy">
                          <FilterNone />
                        </IconButton>
                      </CopyToClipboard>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
        {didDocument.service
          && didDocument.service.map(service => (
            <ExpansionPanel style={{ width: '100%' }} key={service.id}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{service.id}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <List style={{ width: '100%' }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Fingerprint />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      style={{ wordBreak: 'break-all', marginRight: '2px' }}
                      primary={'ID'}
                      secondary={service.id}
                    />
                    <ListItemSecondaryAction>
                      <CopyToClipboard
                        text={service.id}
                        key={service.id}
                        onCopy={onCopyToClipboard}
                        style={{ cursor: 'pointer' }}
                      >
                        <IconButton aria-label="Copy">
                          <FilterNone />
                        </IconButton>
                      </CopyToClipboard>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <DeviceHub />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      style={{ wordBreak: 'break-all', marginRight: '2px' }}
                      primary={'Endpoint'}
                      secondary={service.serviceEndpoint}
                    />
                    <ListItemSecondaryAction>
                      <CopyToClipboard
                        text={service.serviceEndpoint}
                        key={service.serviceEndpoint}
                        onCopy={onCopyToClipboard}
                        style={{ cursor: 'pointer' }}
                      >
                        <IconButton aria-label="Copy">
                          <FilterNone />
                        </IconButton>
                      </CopyToClipboard>
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Https />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      style={{ wordBreak: 'break-all', marginRight: '2px' }}
                      primary={'Type'}
                      secondary={service.type}
                    />
                    <ListItemSecondaryAction>
                      <CopyToClipboard
                        text={service.type}
                        key={service.type}
                        onCopy={onCopyToClipboard}
                        style={{ cursor: 'pointer' }}
                      >
                        <IconButton aria-label="Copy">
                          <FilterNone />
                        </IconButton>
                      </CopyToClipboard>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
      </React.Fragment>
    );
  }
}

DIDDocument.propTypes = {
  classes: PropTypes.object.isRequired,
  didDocument: PropTypes.object.isRequired,
  onCopyToClipboard: PropTypes.func.isRequired,
  editor: PropTypes.object,
};

const MaterialUIDIDDocument = withStyles(styles)(DIDDocument);

export { MaterialUIDIDDocument as DIDDocument };

export default MaterialUIDIDDocument;
