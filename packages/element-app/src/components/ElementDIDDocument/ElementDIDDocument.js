import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {
  Paper, Button, Grid, TextField, FormControl, Typography,
} from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import QRCode from 'qrcode.react';

import { ExpansionPanelList } from '../index';

const styles = theme => ({
  container: {
    padding: theme.spacing.unit * 2,
    width: '100%',
  },
  progress: {
    margin: `${theme.spacing.unit * 2}px auto`,
  },
  textField: {},
  publicKeysHeading: {
    marginBottom: theme.spacing.unit * 1,
  },
});

class GithubDIDDocument extends Component {
  render() {
    const { classes, didDocument } = this.props;

    return (
      <Paper className={classes.container}>
        <Grid container spacing={24}>
          <Grid item xs={8}>
            <Typography variant={'body1'}>{didDocument.id}</Typography>
            <br />
            <Typography variant={'body2'} className={classes.publicKeysHeading}>
              Public Keys
            </Typography>
            <ExpansionPanelList
              panels={didDocument.publicKey.map(k => ({
                title: `${k.id} ${k.type}`,
                children: (
                  <form noValidate autoComplete="off" style={{ width: '100%' }}>
                    <FormControl fullWidth disabled>
                      <TextField
                        label="id"
                        className={classes.textField}
                        value={k.id}
                        margin="normal"
                      />
                    </FormControl>
                    <FormControl fullWidth disabled>
                      <TextField
                        label="type"
                        className={classes.textField}
                        value={k.type}
                        margin="normal"
                      />
                    </FormControl>
                    {k.owner && (
                      <FormControl fullWidth disabled>
                        <TextField
                          label="owner"
                          className={classes.textField}
                          value={k.owner}
                          margin="normal"
                        />
                      </FormControl>
                    )}

                    <FormControl fullWidth disabled>
                      <CopyToClipboard
                        text={k.publicKeyPem || k.publicKeyHex}
                        onCopy={() => {
                          this.props.snackbarMessage({
                            snackbarMessage: {
                              message: 'Copied Public Key ...',
                              variant: 'success',
                              open: true,
                            },
                          });
                        }}
                      >
                        <Button style={{ marginTop: '28px' }} fullWidth variant="contained">
                          Copy Public Key
                        </Button>
                      </CopyToClipboard>
                    </FormControl>
                  </form>
                ),
              }))}
            />
          </Grid>

          <Grid item xs={4}>
            <QRCode value={didDocument.id} style={{ width: '100%', height: '100%' }} />
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

GithubDIDDocument.propTypes = {
  classes: PropTypes.object.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  didDocument: PropTypes.object.isRequired,
};

export default withStyles(styles)(GithubDIDDocument);
