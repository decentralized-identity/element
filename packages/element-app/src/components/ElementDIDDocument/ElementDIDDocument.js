import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { DIDDocument } from '../DIDDocument';

const styles = theme => ({
  container: {
    padding: theme.spacing(2),
    width: '100%',
  },
  progress: {
    margin: `${theme.spacing(2)}px auto`,
  },
  textField: {},
  publicKeysHeading: {
    marginBottom: theme.spacing(1),
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
        onCopyToClipboard={item => {
          this.props.doSetTmuiProp({
            snackBarMessage: {
              open: true,
              variant: 'success',
              message: `Copied ${item}`,
              vertical: 'top',
              horizontal: 'right',
              autoHideDuration: 5000,
            },
          });
        }}
      />
    );
  }
}

ElementDIDDocument.propTypes = {
  classes: PropTypes.object.isRequired,
  doSetTmuiProp: PropTypes.func.isRequired,
  didDocument: PropTypes.object.isRequired,
};

const MaterialUIDIDDocument = withStyles(styles)(ElementDIDDocument);

export { MaterialUIDIDDocument as ElementDIDDocument };

export default MaterialUIDIDDocument;
