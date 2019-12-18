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
import FilterNone from '@material-ui/icons/FilterNone';
import VerifiedUser from '@material-ui/icons/VerifiedUser';

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
