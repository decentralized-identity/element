import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';

import {
  Paper,
  List,
  ListItem,
  Avatar,
  Typography,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';

import { VerifiedUser, Forward } from '@material-ui/icons';

// eslint-disable-next-line
const styles = theme => ({});

class DIDListItem extends Component {
  render() {
    const { record, onClick } = this.props;
    return (
      <React.Fragment>
        <Paper style={{ width: '100%', wordBreak: 'break-all' }}>
          <List>
            <ListItem>
              <Avatar>
                <VerifiedUser />
              </Avatar>
              <ListItemText
                primary={record.doc.id}
                secondary={
                  <React.Fragment>
                    <Typography component="span">
                      {`Updated ${moment(
                        record.lastTransaction.transactionTimestamp * 1000,
                      ).fromNow()}`}
                    </Typography>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  aria-label="Select DID"
                  style={{ marginRight: '12px' }}
                  onClick={() => {
                    onClick(record);
                  }}
                >
                  <Forward />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
      </React.Fragment>
    );
  }
}

DIDListItem.propTypes = {
  classes: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

const MaterialUIDIDDocument = withStyles(styles)(DIDListItem);

export { MaterialUIDIDDocument as DIDListItem };

export default MaterialUIDIDDocument;
