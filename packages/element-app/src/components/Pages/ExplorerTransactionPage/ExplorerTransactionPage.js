import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';

import { Pages } from '../../index';

import { SidetreeTransaction } from '../../SidetreeTransaction';
import { SidetreeAnchorFile } from '../../SidetreeAnchorFile';
import { SidetreeBatchFile } from '../../SidetreeBatchFile';

export class ExplorerTransactionPage extends Component {
  componentWillMount() {
    this.props.getSidetreeOperationsFromTransactionHash(
      this.props.match.params.transactionHash,
    );
  }

  render() {
    const { nodeStore } = this.props;
    const { sidetreeTransactionSummary } = nodeStore;
    const prefix = this.props.fullNode ? '/server' : '/dapp';
    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant="h3" style={{ marginBottom: '8px' }}>
              Element Transaction
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {!sidetreeTransactionSummary ? (
              <LinearProgress color="primary" variant="query" />
            ) : (
              <React.Fragment>
                <SidetreeTransaction
                  transaction={sidetreeTransactionSummary.transaction}
                  blockchain={'Ethereum'}
                  network={'ropsten'}
                  expanded={true}
                />

                <SidetreeAnchorFile
                  anchorFileHash={sidetreeTransactionSummary.transaction.anchorFileHash}
                  anchorFile={sidetreeTransactionSummary.anchorFile}
                  onClickUID={(didUniqueSuffix) => {
                    this.props.history.push(`${prefix}/operations/${didUniqueSuffix}`);
                  }}
                  expanded={true}
                />

                <SidetreeBatchFile
                  batchFileHash={sidetreeTransactionSummary.anchorFile.batchFileHash}
                  batchFile={sidetreeTransactionSummary.batchFile}
                  operations={sidetreeTransactionSummary.operations}
                  transaction={sidetreeTransactionSummary.transaction}
                  expanded={true}
                />
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

ExplorerTransactionPage.propTypes = {
  nodeStore: PropTypes.object.isRequired,
  getSidetreeOperationsFromTransactionHash: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  fullNode: PropTypes.object,
};
