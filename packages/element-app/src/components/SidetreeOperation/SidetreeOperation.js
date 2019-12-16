import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import moment from 'moment';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

// eslint-disable-next-line
import 'brace/mode/json';
// eslint-disable-next-line
import 'brace/theme/mono_industrial';

import Grid from '@material-ui/core/Grid/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';

import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import {
  VerifiedUser, ExpandMore, Lock, Edit,
} from '@material-ui/icons';

// eslint-disable-next-line
const styles = theme => ({
  // Look at here: applied specific styles to resizing and background
  expansion: {
    backgroundColor: '#1C2420',
  },
});

class SidetreeOperation extends Component {
  state = {
    expanded: false,
  };

  componentWillMount() {
    this.setState({
      expanded: this.props.expanded,
    });
  }

  render() {
    const { operation, classes } = this.props;
    const { expanded } = this.state;

    const { decodedOperationPayload } = operation.operation;
    const { transactionTimestamp } = operation.transaction;
    const header = operation.operation.decodedHeader;
    const { alg, kid, operation: operationName } = header;
    const { signature } = operation.operation.decodedOperation;

    return (
      <ExpansionPanel expanded={expanded} className={classes.expansion}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          onClick={() => {
            this.setState({
              expanded: !expanded,
            });
          }}
        >
          <Grid container>
            <Grid item xs={12} md={6} style={{ display: 'inherit' }}>
              <Avatar style={{ marginRight: '16px' }}>
                <VerifiedUser />
              </Avatar>
              <Typography
                style={{ paddingTop: '4px' }}
                variant={'subtitle1'}
              >{`${operationName.toUpperCase()} ${'Operation'}`}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                style={{ paddingTop: '8px', wordBreak: 'break-all' }}
                variant={'subtitle2'}
              >{`${moment(transactionTimestamp * 1000).fromNow()}`}</Typography>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <Edit />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                style={{ wordBreak: 'break-all', marginRight: '2px' }}
                primary={operationName}
                secondary={`${alg} ${kid}`}
              />
            </ListItem>

            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <Lock />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                style={{ wordBreak: 'break-all', marginRight: '2px' }}
                primary={'Signature'}
                secondary={`${signature}`}
              />
            </ListItem>
          </List>

          <AceEditor
            mode="json"
            theme="mono_industrial"
            style={{ width: '100%', height: '300px' }}
            readOnly
            wrapEnabled={true}
            name="payloadViewer"
            value={JSON.stringify(decodedOperationPayload, null, 2)}
            editorProps={{ $blockScrolling: true }}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

SidetreeOperation.propTypes = {
  operation: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool,
};

const StyledComponent = withStyles(styles)(SidetreeOperation);

export { StyledComponent as SidetreeOperation };

export default StyledComponent;
