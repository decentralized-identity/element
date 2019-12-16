import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';

import DoneAll from '@material-ui/icons/DoneAll';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import Receipt from '@material-ui/icons/Receipt';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Link from '@material-ui/icons/Link';
import Fingerprint from '@material-ui/icons/Fingerprint';

const getIpfsUrl = (anchorFileBase, anchorFileHash) => {
  if (anchorFileBase) {
    return `${anchorFileBase}/${anchorFileHash}`;
  }
  return `https://ipfs.infura.io:5001/api/v0/cat?arg=${anchorFileHash}`;
};

export class SidetreeAnchorFile extends Component {
  state = {
    expanded: false,
  };

  componentWillMount() {
    this.setState({
      expanded: this.props.expanded,
    });
  }

  render() {
    const { anchorFileHash, anchorFileBase, anchorFile } = this.props;

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
              >{`${'Anchor File'}`}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                style={{ paddingTop: '8px', wordBreak: 'break-all' }}
                variant={'subtitle2'}
              >{`${anchorFileHash}`}</Typography>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
          <div>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <DoneAll />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  style={{ wordBreak: 'break-all', marginRight: '2px' }}
                  primary="Batch File Hash"
                  secondary={anchorFile.batchFileHash}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    aria-label="Link"
                    target="_blank"
                    href={getIpfsUrl(anchorFileBase, anchorFile.batchFileHash)}
                  >
                    <Link />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <Receipt />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  style={{ wordBreak: 'break-all', marginRight: '2px' }}
                  primary={'Merkle Root'}
                  secondary={anchorFile.merkleRoot}
                />
                {/* TODO: add verify dialog button here... */}
                {/* <ListItemSecondaryAction>
                  <IconButton aria-label="Link" href={'asdf'}>
                    <Link />
                  </IconButton>
                </ListItemSecondaryAction> */}
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <Fingerprint />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  style={{ wordBreak: 'break-all', marginRight: '2px' }}
                  primary="UIDs"
                  secondary={anchorFile.didUniqueSuffixes.length}
                />
              </ListItem>

              {anchorFile.didUniqueSuffixes.map(didUniqueSuffix => (
                <Button
                  size={'small'}
                  variant={'outlined'}
                  style={{ marginTop: '4px' }}
                  key={didUniqueSuffix}
                  onClick={() => {
                    if (this.props.onClickUID) {
                      this.props.onClickUID(didUniqueSuffix);
                    }
                  }}
                >
                  {didUniqueSuffix}
                </Button>
              ))}
            </List>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

SidetreeAnchorFile.propTypes = {
  anchorFileHash: PropTypes.string.isRequired,
  anchorFile: PropTypes.object.isRequired,
  anchorFileBase: PropTypes.string,
  onClickUID: PropTypes.func,
  expanded: PropTypes.bool,
};

export default SidetreeAnchorFile;
