import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { compose } from 'recompose';

import { Typography, Grid, LinearProgress } from '@material-ui/core';

import { Pages } from '../../../components/index';

import ligthNode from '../../../redux/lightNode';

import { SidetreeOperation } from '../../../components/SidetreeOperation';
import { DIDDocument } from '../../../components/DIDDocument';

class DAppElementOperationsPage extends Component {
  async componentWillMount() {
    if (this.props.match.params.uid) {
      this.props.getOperationsForUID(this.props.match.params.uid);
    } else {
      this.props.getOperationsForUID();
    }
  }

  render() {
    const { lightNode, snackbarMessage } = this.props;
    const { sidetreeOperations, didDocumentForOperations, loading } = lightNode;

    const content = () => {
      if (loading || !sidetreeOperations) {
        return <LinearProgress color="primary" variant="query" />;
      }
      return (
        <React.Fragment>
          <Grid item xs={12}>
            <DIDDocument
              didDocument={didDocumentForOperations}
              onCopyToClipboard={() => {
                snackbarMessage({
                  snackbarMessage: {
                    message: 'Copied to clipboard.',
                    variant: 'success',
                    open: true,
                  },
                });
              }}
            />
            <br />
          </Grid>

          {sidetreeOperations.map(op => (
            <Grid item xs={12} key={op.operation.operationHash}>
              <SidetreeOperation operation={op} expanded={false} />
              <br />
            </Grid>
          ))}
        </React.Fragment>
      );
    };
    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
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

DAppElementOperationsPage.propTypes = {
  lightNode: PropTypes.object.isRequired,
  getOperationsForUID: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
};

const ConnectedDAppElementOperationsPage = compose(
  withRouter,
  ligthNode.container,
)(DAppElementOperationsPage);

export { ConnectedDAppElementOperationsPage as DAppElementOperationsPage };

export default ConnectedDAppElementOperationsPage;
