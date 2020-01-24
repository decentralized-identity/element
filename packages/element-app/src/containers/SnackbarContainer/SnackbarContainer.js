import React from 'react';
import PropTypes from 'prop-types';

import Snackbar from '../../components/Snackbar/Snackbar';

class SnackbarContainer extends React.Component {
  render() {
    return <Snackbar {...this.props} />;
  }
}

SnackbarContainer.propTypes = {
  doSetTmuiProp: PropTypes.any.isRequired,
};

export { SnackbarContainer };
export default SnackbarContainer;
