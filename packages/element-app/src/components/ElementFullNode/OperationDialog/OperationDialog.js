import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import _ from 'lodash';
// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

// eslint-disable-next-line
import 'brace/mode/json';
// eslint-disable-next-line
import 'brace/theme/github';

class DisplayPlayloadDialog extends React.Component {
  state = {
    open: false,
    type: '',
    kid: '#key1',
    jsonData: {},
  };

  handleClose = () => {
    this.props.onClose();
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
    });
  }

  handleSubmit = () => {
    const { wallet } = this.props;
    const { type, kid, jsonData } = this.state;
    const keypair = Object.values(wallet.data.keys)[0];
    this.props.signAndSubmit(type, kid, jsonData, keypair.privateKey);
    this.handleClose();
  };

  render() {
    const { wallet } = this.props;

    const keypair = Object.values(wallet.data.keys)[0];

    const { jsonData } = this.state;

    return (
      <div>
        <Dialog
          fullScreen
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Payload</DialogTitle>
          <DialogContent>
            <Button
              onClick={() => {
                this.setState({
                  type: 'create',
                  jsonData: {
                    '@context': 'https://w3id.org/did/v1',
                    publicKey: [
                      {
                        id: '#key1',
                        type: 'Secp256k1VerificationKey2018',
                        publicKeyHex: keypair.publicKey,
                      },
                    ],
                    service: [
                      {
                        id: '#transmute.element.full-node',
                        type: 'Transmute.Element.FullNode',
                        serviceEndpoint: `${window.location.href}#${Math.random()}`,
                      },
                    ],
                  },
                });
              }}
            >
              Create
            </Button>{' '}
            <Button
              onClick={() => {
                this.setState({
                  type: 'update',
                  jsonData: {
                    did: 'did:sidetree:UID',
                    previousOperationHash: 'UID',
                    patch: [
                      {
                        op: 'replace',
                        path: '/service/1',
                        value: {
                          id: '#transmute.element.full-node',
                          type: 'Transmute.Element.FullNode',
                          serviceEndpoint: `${window.location.href}#${Math.random()}`,
                        },
                      },
                    ],
                  },
                });
              }}
            >
              Update
            </Button>
            <AceEditor
              mode="json"
              theme="github"
              style={{ width: '100%' }}
              name="jsonEditor"
              onChange={(value) => {
                this.setState({ jsonData: JSON.parse(value) });
              }}
              value={JSON.stringify(jsonData, null, 2)}
              editorProps={{ $blockScrolling: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Close
            </Button>
            <Button
              disabled={_.isEqual(jsonData, {})}
              variant={'contained'}
              onClick={this.handleSubmit}
              color="primary"
            >
              Sign and Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DisplayPlayloadDialog.propTypes = {
  open: PropTypes.bool,
  wallet: PropTypes.object.isRequired,
  signAndSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DisplayPlayloadDialog;
