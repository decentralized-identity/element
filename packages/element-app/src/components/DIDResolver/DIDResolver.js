import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Button, Grid, TextField, CircularProgress,
} from '@material-ui/core';

import { ElementDIDDocument } from '../index';

const styles = theme => ({
  progress: {
    margin: `${theme.spacing.unit * 2}px auto`,
  },
});

class DIDResolver extends Component {
  state = {
    currentDID: '',
  };

  safeResolve = () => {
    this.props.resolveDID(this.state.currentDID);
  };

  componentWillMount() {
    if (this.props.did) {
      this.setState({
        currentDID: this.props.did,
      });
      this.props.resolveDID(this.props.did);
    }
  }

  render() {
    const { store, classes } = this.props;
    const { currentDID } = this.state;

    const showProgress = currentDID && store.resolving;
    const didDocument = store.dids[currentDID];

    return (
      <Grid container spacing={24}>
        <Grid item xs={12} sm={10}>
          <TextField
            label="Element Resolver"
            value={currentDID}
            placeholder={'Enter a DID (did:elem:...)'}
            fullWidth
            onChange={(event) => {
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

        {showProgress ? (
          <CircularProgress className={classes.progress} color="secondary" />
        ) : (
          didDocument && <ElementDIDDocument didDocument={didDocument} />
        )}
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
