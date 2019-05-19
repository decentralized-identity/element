import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { DIDDocument } from '../DIDDocument';

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

class ElementDIDDocument extends Component {
  render() {
    const {
      // classes,
      didDocument,
    } = this.props;

    return (
      <DIDDocument
        didDocument={didDocument}
        onCopyToClipboard={(item) => {
          console.log(item);
          this.props.snackbarMessage({
            snackbarMessage: {
              message: 'Copied ',
              variant: 'success',
              open: true,
            },
          });
        }}
      />
    );
  }
}

ElementDIDDocument.propTypes = {
  classes: PropTypes.object.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
  didDocument: PropTypes.object.isRequired,
};

const MaterialUIDIDDocument = withStyles(styles)(ElementDIDDocument);

export { MaterialUIDIDDocument as ElementDIDDocument };

export default MaterialUIDIDDocument;
