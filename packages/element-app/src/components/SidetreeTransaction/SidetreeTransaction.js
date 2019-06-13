import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

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
import {
  DoneAll,
  VerifiedUser,
  Receipt,
  ExpandMore,
  Link,
  LocalActivity,
} from '@material-ui/icons';

const getBlockExplorerUrl = (blockHash, blockchain, network) => {
  if (blockchain === 'Ethereum') {
    const sub = network ? `${network}.` : '';
    return `https://${sub}etherscan.io/block/${blockHash}`;
  }
  return '#';
};

const getIpfsUrl = (anchorFileBase, anchorFileHash) => {
  if (anchorFileBase) {
    return `${anchorFileBase}/${anchorFileHash}`;
  }
  return `https://ipfs.io/ipfs/${anchorFileHash}`;
};

export class SidetreeTransaction extends Component {
  state = {
    expanded: false,
  };

  componentWillMount() {
    this.setState({
      expanded: this.props.expanded,
    });
  }

  render() {
    const {
      txn, blockchain, network, anchorFileBase,
    } = this.props;

    const { expanded } = this.state;

    const blochHashUrl = getBlockExplorerUrl(txn.transactionTimeHash, blockchain, network);
    const ipfsUrl = getIpfsUrl(anchorFileBase, txn.anchorFileHash);
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
            <Grid item xs={12} sm={9} style={{ display: 'inherit' }}>
              <Avatar style={{ marginRight: '16px' }}>
                <VerifiedUser />
              </Avatar>
              <Typography style={{ paddingTop: '4px' }} variant={'subtitle1'}>
                {'Anchor'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography style={{ paddingTop: '8px' }} variant={'subtitle2'}>{`${
                !txn.transactionTimestamp
                  ? `Transaction ${txn.transactionNumber}`
                  : `${moment(txn.transactionTimestamp * 1000).fromNow()}`
              }`}</Typography>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
          <div>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <LocalActivity />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  style={{ wordBreak: 'break-all', marginRight: '2px' }}
                  primary={`Transaction ${txn.transactionNumber}`}
                  secondary={
                    !txn.transactionTimestamp
                      ? ''
                      : `${moment(txn.transactionTimestamp * 1000).fromNow()}`
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <Receipt />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  style={{ wordBreak: 'break-all', marginRight: '2px' }}
                  primary={`${blockchain} Block ${txn.transactionTime}`}
                  secondary={txn.transactionTimeHash}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    aria-label="Link"
                    onClick={() => {
                      if (this.props.onClickTransactionTimeHash) {
                        this.props.onClickTransactionTimeHash(txn.transactionTimeHash);
                      } else {
                        window.open(blochHashUrl);
                      }
                    }}
                  >
                    <Link />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <DoneAll />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  style={{ wordBreak: 'break-all', marginRight: '2px' }}
                  primary="Anchor File Hash"
                  secondary={txn.anchorFileHash}
                />
                <ListItemSecondaryAction>
                  <IconButton aria-label="Link" href={ipfsUrl} target="_blank">
                    <Link />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

SidetreeTransaction.propTypes = {
  txn: PropTypes.object.isRequired,
  blockchain: PropTypes.string.isRequired,
  network: PropTypes.string,
  expanded: PropTypes.bool,
  anchorFileBase: PropTypes.string,
  onClickTransactionTimeHash: PropTypes.func,
};

export default SidetreeTransaction;
