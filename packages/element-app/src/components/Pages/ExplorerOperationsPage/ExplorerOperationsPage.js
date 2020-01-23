import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { Pages } from '../../index';
import { SidetreeOperation } from '../../SidetreeOperation';
import { DIDDocument } from '../../DIDDocument';
import Loading from '../../Loading/Loading';

export class ExplorerOperationsPage extends Component {
  async componentWillMount() {
    if (this.props.match.params.didUniqueSuffix) {
      this.props.getOperationsForDidUniqueSuffix(
        this.props.match.params.didUniqueSuffix
      );
    }
  }

  render() {
    const { nodeStore } = this.props;
    const { sidetreeOperations, loading, didDocumentForOperations } = nodeStore;

    const content = () => {
      if (loading || !sidetreeOperations) {
        return (
          <div style={{ marginTop: '15%' }}>
            <Loading message={'Resolving...'} />
          </div>
        );
      }
      return (
        <React.Fragment>
          {didDocumentForOperations && (
            <Grid item xs={12}>
              <DIDDocument
                didDocument={didDocumentForOperations}
                onCopyToClipboard={item => {
                  this.props.doSetTmuiProp({
                    snackBarMessage: {
                      open: true,
                      variant: 'success',
                      message: `Copied ${item}`,
                      vertical: 'bottom',
                      horizontal: 'right',
                      autoHideDuration: 5000,
                    },
                  });
                }}
              />
              <br />
            </Grid>
          )}
          {sidetreeOperations.map(op => (
            <Grid item xs={12} key={op.transaction.transactionNumber}>
              <SidetreeOperation operation={op} expanded={false} />
              <br />
            </Grid>
          ))}
        </React.Fragment>
      );
    };
    return (
      <Pages.WithNavigation>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h3" style={{ marginBottom: '8px' }}>
              Element Operations
            </Typography>
            {content()}
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

ExplorerOperationsPage.propTypes = {
  nodeStore: PropTypes.object.isRequired,
  getOperationsForDidUniqueSuffix: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  doSetTmuiProp: PropTypes.func.isRequired,
};
