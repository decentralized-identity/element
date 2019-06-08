import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';

import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {
  DoneAll, VerifiedUser, Receipt, ExpandMore, Link, Fingerprint,
} from '@material-ui/icons';

import { SidetreeOperation } from '../SidetreeOperation';

export class SidetreeBatchFile extends Component {
  state = {
    expanded: false,
  };

  componentWillMount() {
    this.setState({
      expanded: this.props.expanded,
    });
  }

  render() {
    const { batchFileHash, batchFile, operations } = this.props;

    const { expanded } = this.state;

    return (
      <ExpansionPanel expanded={expanded}>
        <ExpansionPanelSummary
          onClick={() => {
            this.setState({
              expanded: !expanded,
            });
          }}
          expandIcon={<ExpandMore />}
        >
          <Grid container>
            <Grid item xs={12} md={6} style={{ display: 'inherit' }}>
              <Avatar style={{ marginRight: '16px' }}>
                <VerifiedUser />
              </Avatar>
              <Typography
                style={{ paddingTop: '4px' }}
                variant={'subtitle1'}
              >{`${'Batch File'}`}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                style={{ paddingTop: '8px', wordBreak: 'break-all' }}
                variant={'subtitle2'}
              >{`${batchFileHash}`}</Typography>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
          {operations.map(op => (
            <React.Fragment key={op.operationHash}>
              <SidetreeOperation operation={op} expanded={true} />
            </React.Fragment>
          ))}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

SidetreeBatchFile.propTypes = {
  batchFileHash: PropTypes.string.isRequired,
  batchFile: PropTypes.object.isRequired,
  operations: PropTypes.array.isRequired,
  expanded: PropTypes.bool,
};

export default SidetreeBatchFile;
