import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Paper,
  Button,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Chip,
} from '@material-ui/core';

import { red } from '@material-ui/core/colors';

import QRCode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import CreateWalletCard from './CreateWalletCard';
import ImportWalletFileCard from './ImportWalletFileCard';
import ImportWalletQRCard from './ImportWalletQRCard';
import WalletLockDialog from './WalletLockDialog';

import { ExpansionPanelList } from '../index';

import { AddKeyDialog } from './AddKeyDialog';

class DIDWallet extends Component {
  state = {
    isWalletLockDialogOpen: false,
    isAddKeyDialogOpen: false,
  };

  handleChange = () => () => {
    this.setState({
      isWalletLockDialogOpen: true,
    });
  };

  handleUnlock = (password) => {
    this.setState({
      isWalletLockDialogOpen: false,
      isAddKeyDialogOpen: false,
    });
    this.props.toggleWallet(password);
    this.setState({ locked: false });
  };

  render() {
    const { importCipherTextWallet, wallet, addKeyToWallet } = this.props;
    const { isWalletLockDialogOpen, isAddKeyDialogOpen } = this.state;
    const walletIsLocked = typeof wallet.data === 'string';
    const walletState = !walletIsLocked ? 'unlocked' : 'locked';

    return (
      <div>
        <Typography variant="h6">
          A DID Wallet is required to store keys used to sign Sidetree Operations, whether you are
          anchoring them to a blockchain yourself, or using a server / full node.
        </Typography>
        <br />
        <Grid container spacing={24}>
          {wallet.data && (
            <Grid item xs={12}>
              <Paper
                style={{
                  padding: '16px',
                  margin: '0px',
                  backgroundColor: walletState === 'unlocked' ? red[900] : '',
                }}
              >
                <WalletLockDialog
                  open={isWalletLockDialogOpen}
                  walletState={walletState}
                  onPassword={this.handleUnlock}
                />

                <div style={{ flexDirection: 'column', display: 'flex' }}>
                  <FormControl component="fieldset">
                    <div style={{ float: 'right' }}>
                      <Button
                        style={{ float: 'right' }}
                        onClick={() => {
                          localStorage.removeItem('persist:elementDID');
                          window.location.reload();
                        }}
                        variant="contained"
                      >
                        Delete From Browser
                      </Button>
                    </div>
                    <FormLabel component="legend">DID Wallet</FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch checked={walletIsLocked} onChange={this.handleChange('locked')} />
                        }
                        label={walletIsLocked ? 'Locked' : 'Unlocked!'}
                      />
                    </FormGroup>
                  </FormControl>
                  <FormControl component="fieldset" disabled>
                    {walletIsLocked && (
                      <QRCode value={wallet.data} style={{ width: '100%', height: '100%' }} />
                    )}
                  </FormControl>

                  <FormControl component="fieldset" disabled>
                    {!walletIsLocked
                      && Object.keys(wallet.data.keys).map((kid) => {
                        const key = wallet.data.keys[kid];
                        return (
                          <React.Fragment key={kid}>
                            <ExpansionPanelList
                              panels={[
                                {
                                  title: `${key.tags[0]} ${kid.substring(0, 8)}...`,
                                  children: (
                                    <div style={{ width: '100%' }}>
                                      <Typography variant="body2">{key.notes}</Typography>
                                      <br />
                                      <div>
                                        {key.tags.map(t => (
                                          <Chip
                                            key={t}
                                            label={t}
                                            variant="outlined"
                                            style={{ margin: '4px' }}
                                          />
                                        ))}
                                      </div>
                                      <br />
                                      <CopyToClipboard
                                        text={key.publicKey}
                                        onCopy={() => {
                                          this.props.snackbarMessage({
                                            snackbarMessage: {
                                              message: `Copied Public Key: ${key.publicKey.substring(
                                                0,
                                                32,
                                              )} ...`,
                                              variant: 'success',
                                              open: true,
                                            },
                                          });
                                        }}
                                      >
                                        <Button style={{ marginTop: '16px' }} variant="contained">
                                          Copy Public Key
                                        </Button>
                                      </CopyToClipboard>{' '}
                                      {/* <Button style={{ marginTop: '16px' }} variant="contained">
                                        Delete Key
                                      </Button> */}
                                    </div>
                                  ),
                                },
                              ]}
                            />
                            <br />
                          </React.Fragment>
                        );
                      })}
                  </FormControl>
                </div>

                <div style={{ paddingTop: '16px' }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      this.setState({
                        isAddKeyDialogOpen: true,
                      });
                    }}
                  >
                    Add New Key
                  </Button>
                  <AddKeyDialog
                    open={isAddKeyDialogOpen}
                    onSubmit={(data) => {
                      addKeyToWallet(data);
                      this.setState({
                        isAddKeyDialogOpen: false,
                      });
                    }}
                  />
                </div>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={4}>
            <CreateWalletCard />
          </Grid>
          <Grid item xs={12} md={4}>
            <ImportWalletFileCard importCipherTextWallet={importCipherTextWallet} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ImportWalletQRCard importCipherTextWallet={importCipherTextWallet} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

DIDWallet.propTypes = {
  wallet: PropTypes.object.isRequired,
  importCipherTextWallet: PropTypes.func.isRequired,
  toggleWallet: PropTypes.func.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  addKeyToWallet: PropTypes.func.isRequired,
};

export default DIDWallet;
