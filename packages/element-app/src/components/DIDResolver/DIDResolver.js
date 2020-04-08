import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { ElementDIDDocument } from '../index';
import { Loading } from '../Loading/Loading';
import { SidetreeOperation } from '../SidetreeOperation';
import config from '../../config';

const styles = theme => ({
  progress: {
    margin: `${theme.spacing(2)}px auto`,
  },
});

class DIDResolver extends Component {
  state = {
    currentDID: '',
  };

  safeResolve = () => {
    this.props.resolveDID(this.state.currentDID);
  };

  componentDidMount() {
    if (this.props.did) {
      this.setState({
        currentDID: this.props.did,
      });
      this.props.resolveDID(this.props.did);
    }
  }

  render() {
    const { store } = this.props;
    const { currentDID } = this.state;

    const showProgress = currentDID && store.resolving;
    // eslint-disable-next-line security/detect-object-injection
    const didDocument = store.dids[currentDID];

    const { sidetreeOperations } = store;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" style={{ marginBottom: '8px' }}>
            DID Resolver
          </Typography>

          <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
            Use this page to resolve Element DIDs.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={10}>
          <TextField
            label="Element Resolver"
            value={currentDID}
            placeholder={`Enter a DID (${config.DID_METHOD_NAME}:...)`}
            fullWidth
            onChange={event => {
              this.setState({
                currentDID: event.target.value,
              });
            }}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            style={{ marginTop: '28px' }}
            fullWidth
            disabled={store.resolving}
            variant="contained"
            onClick={() => {
              this.safeResolve();
            }}
          >
            Resolve
          </Button>
        </Grid>

        <div style={{ marginTop: '16px', width: '100%', padding: '8px' }}>
          {showProgress ? (
            <div style={{ marginTop: '15%' }}>
              <Loading message={'Resolving...'} />
            </div>
          ) : (
            didDocument && (
              <React.Fragment>
                <Typography variant="h6" style={{ marginBottom: '8px' }}>
                  DID Document
                </Typography>
                <ElementDIDDocument didDocument={didDocument} />

                <Typography
                  variant="h6"
                  style={{ marginTop: '24px', marginBottom: '8px' }}
                >
                  Operations
                </Typography>

                {sidetreeOperations
                  .sort((a, b) => {
                    return a.transaction.transactionNumber <=
                      b.transaction.transactionNumber
                      ? 1
                      : -1;
                  })
                  .map(op => (
                    <Grid
                      item
                      xs={12}
                      key={op.transaction.transactionNumber}
                      style={{ marginBottom: '8px' }}
                    >
                      <SidetreeOperation operation={op} expanded={false} />
                    </Grid>
                  ))}
              </React.Fragment>
            )
          )}
        </div>
      </Grid>
    );
  }
}

DIDResolver.propTypes = {
  classes: PropTypes.object.isRequired,
  did: PropTypes.string,
  resolveDID: PropTypes.func.isRequired,
  store: PropTypes.object.isRequired,
};

export default withStyles(styles)(DIDResolver);
