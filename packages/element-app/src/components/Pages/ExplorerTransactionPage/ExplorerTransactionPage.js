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
    this.props.getSidetreeOperationsFromTransactionTimeHash(
      this.props.match.params.transactionTimeHash,
    );
  }

  render() {
    const { nodeStore } = this.props;
    const { sidetreeTransactionSummary } = nodeStore;
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
                    this.props.history.push(`/server/operations/${didUniqueSuffix}`);
                  }}
                  expanded={true}
                />

                <SidetreeBatchFile
                  batchFileHash={sidetreeTransactionSummary.anchorFile.batchFileHash}
                  batchFile={sidetreeTransactionSummary.batchFile}
                  operations={sidetreeTransactionSummary.operations}
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
  getSidetreeOperationsFromTransactionTimeHash: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};
