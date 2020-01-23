import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import clsx from 'clsx';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Card from '@material-ui/core/Card';
import Chip from '@material-ui/core/Chip';

import Avatar from '@material-ui/core/Avatar';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red, blue } from '@material-ui/core/colors';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  LockOpen,
  NoteAdd,
  Lock,
  CloudDownload,
  Create,
} from '@material-ui/icons';

import ExpansionPanelList from './ExpansionPanelList';

import keystoreImage from './key.svg';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 512,
  },
  media: {
    height: 0,
    backgroundSize: 'contain',
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}));

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function KeystoreStatusIcon({ status }) {
  switch (status) {
    case 'empty':
      return <NoteAdd />;
    case 'create':
      return <Create />;
    case 'locked':
      return <Lock />;
    case 'unlocked':
      return <LockOpen />;
    default:
      return <LockOpen />;
  }
}

KeystoreStatusIcon.propTypes = {
  status: PropTypes.any,
};

function keyStoreStatusColor({ status }) {
  switch (status) {
    case 'empty':
      return blue[500];
    case 'locked':
      return blue[500];
    case 'unlocked':
      return red[500];
    default:
      return red[500];
  }
}

function KeystoreCard({
  status,
  title,
  subheader,
  keystore,
  doImportKeystore,
  doDeleteKeystore,
  doCreateWalletKeystore,
  onOpenKeystoreLockDialog,
  onOpenKeystoreEditDialog,
}) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card className={classes.card}>
      <input
        // accept="text/plain"
        style={{ display: 'none' }}
        id="keystore-file-input"
        multiple
        onChange={event => {
          Object.keys(event.target.files).map(index => {
            // eslint-disable-next-line security/detect-object-injection
            const file = event.target.files[index];
            const reader = new FileReader();
            reader.onload = upload => {
              doImportKeystore(upload.target.result);
            };
            return reader.readAsText(file);
          });
        }}
        type="file"
      />
      <CardHeader
        avatar={
          <Avatar
            aria-label="recipe"
            style={{
              backgroundColor: keyStoreStatusColor({ status }),
            }}
          >
            <KeystoreStatusIcon status={status} />
          </Avatar>
        }
        title={title}
        // subheader={status}
        action={
          <React.Fragment>
            {status === 'empty' ? (
              <React.Fragment />
            ) : (
              <React.Fragment>
                <IconButton
                  aria-label="settings"
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleClick}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem
                    onClick={() => {
                      doDeleteKeystore();
                      handleClose();
                    }}
                  >
                    Delete
                  </MenuItem>
                  {status === 'unlocked' && (
                    <MenuItem
                      onClick={() => {
                        onOpenKeystoreEditDialog();
                        handleClose();
                      }}
                    >
                      Edit
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={() => {
                      onOpenKeystoreLockDialog();
                      handleClose();
                    }}
                  >
                    {status === 'locked' ? 'Unlock' : 'Lock'}
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </React.Fragment>
        }
      />
      {status !== 'empty' && (
        <CardMedia
          className={classes.media}
          image={keystoreImage}
          title="Keystore"
        />
      )}

      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {subheader}
        </Typography>
      </CardContent>

      {status === 'empty' && (
        <CardActions>
          <Button
            aria-label="import"
            onClick={() => {
              document.getElementById('keystore-file-input').click();
            }}
            endIcon={<KeystoreStatusIcon status={status} />}
          >
            Import
          </Button>

          <Button
            onClick={() => {
              doCreateWalletKeystore();
            }}
            endIcon={<KeystoreStatusIcon status={'create'} />}
          >
            Create
          </Button>
        </CardActions>
      )}
      {status !== 'empty' && (
        <React.Fragment>
          <CardActions disableSpacing>
            {status === 'locked' && (
              <IconButton
                aria-label="Export Keystore"
                onClick={() => {
                  download('keystore.txt', keystore.data);
                }}
              >
                <CloudDownload />
              </IconButton>
            )}

            {status === 'unlocked' && (
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
          </CardActions>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              {status === 'unlocked' &&
                Object.keys(keystore.data.keys).map(kid => {
                  // eslint-disable-next-line security/detect-object-injection
                  const key = keystore.data.keys[kid];

                  return (
                    <ExpansionPanelList
                      key={kid}
                      panels={[
                        {
                          title: `${key.tags[0]} ${kid.substring(0, 8)}...`,
                          children: (
                            <div style={{ width: '100%' }}>
                              <Typography variant="body2">
                                {key.notes}
                              </Typography>
                              <br />

                              <div>
                                {key.tags.map(t => (
                                  <CopyToClipboard
                                    key={t}
                                    text={t}
                                    onCopy={() => {
                                      // eslint-disable-next-line no-alert
                                      alert(`Copied ${t} to clipboard`);
                                    }}
                                  >
                                    <Chip
                                      key={t}
                                      label={t}
                                      variant="outlined"
                                      style={{ margin: '4px' }}
                                    />
                                  </CopyToClipboard>
                                ))}
                              </div>
                              <br />
                              <CopyToClipboard
                                text={key.publicKey}
                                onCopy={() => {
                                  // eslint-disable-next-line no-alert
                                  alert('Copied public key to clipboard');
                                }}
                              >
                                <Button
                                  style={{ marginTop: '16px' }}
                                  fullWidth
                                  variant="contained"
                                >
                                  Copy Public Key
                                </Button>
                              </CopyToClipboard>
                            </div>
                          ),
                        },
                      ]}
                    />
                  );
                })}
            </CardContent>
          </Collapse>
        </React.Fragment>
      )}
    </Card>
  );
}

KeystoreCard.propTypes = {
  status: PropTypes.any,
  title: PropTypes.any,
  subheader: PropTypes.any,
  keystore: PropTypes.any,
  doImportKeystore: PropTypes.any,
  doDeleteKeystore: PropTypes.any,
  doCreateWalletKeystore: PropTypes.any,
  onOpenKeystoreLockDialog: PropTypes.any,
  onOpenKeystoreEditDialog: PropTypes.any,
};

export default KeystoreCard;
