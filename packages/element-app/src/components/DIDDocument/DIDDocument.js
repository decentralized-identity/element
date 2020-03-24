import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import FilterNone from '@material-ui/icons/FilterNone';
import DeviceHub from '@material-ui/icons/DeviceHub';
import Fingerprint from '@material-ui/icons/Fingerprint';
import VpnKey from '@material-ui/icons/VpnKey';
import Https from '@material-ui/icons/Https';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { DIDDocumentHeader } from '../DIDDocumentHeader';

// eslint-disable-next-line
const styles = theme => ({
  didQRCode: {
    width: '128px',
    height: '128px',
    margin: '0 auto',
  },
});

const getKeyValue = publicKey => {
  if (publicKey.publicKeyHex) {
    return publicKey.publicKeyHex;
  }
  if (publicKey.publicKeyBase58) {
    return publicKey.publicKeyBase58;
  }
  return '';
};

class DIDDocument extends Component {
  render() {
    const { didDocument, onCopyToClipboard, editor } = this.props;

    return (
      <React.Fragment>
        <DIDDocumentHeader
          did={didDocument.id}
          onCopyToClipboard={onCopyToClipboard}
        />

        {!!editor && editor}

        {didDocument.publicKey &&
          didDocument.publicKey.map(publicKey => (
            <ExpansionPanel style={{ width: '100%' }} key={publicKey.id}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {publicKey.id.split('#').pop()} {publicKey.type}
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
                      secondary={getKeyValue(publicKey)}
                    />
                    <ListItemSecondaryAction>
                      <CopyToClipboard
                        text={getKeyValue(publicKey)}
                        key={getKeyValue(publicKey)}
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
        {didDocument.service &&
          didDocument.service.map(service => (
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
