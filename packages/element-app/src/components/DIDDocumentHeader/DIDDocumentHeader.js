import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {
  Paper,
  List,
  ListItem,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';

import { FilterNone, VerifiedUser } from '@material-ui/icons';

import { CopyToClipboard } from 'react-copy-to-clipboard';

// eslint-disable-next-line
const styles = theme => ({});

class DIDDocumentHeader extends Component {
  render() {
    const { did, onCopyToClipboard } = this.props;

    return (
      <React.Fragment>
        <Paper style={{ width: '100%', wordBreak: 'break-all' }}>
          <List>
            <ListItem>
              <Avatar>
                <VerifiedUser />
              </Avatar>
              <ListItemText
                primary={did}
                // secondary={
                //   <React.Fragment>
                //     <Typography component="span" className={classes.subtitle}>
                //       {didDocument['@context']}
                //     </Typography>
                //   </React.Fragment>
                // }
              />
              <ListItemSecondaryAction>
                <CopyToClipboard
                  text={did}
                  key={'did'}
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
