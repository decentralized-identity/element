import React from 'react';
import PropTypes from 'prop-types';

import Snackbar from '../../components/Snackbar/Snackbar';

class SnackbarContainer extends React.Component {
  // componentDidMount() {
  //   setTimeout(() => {
  //     this.props.doSetTmuiProp({
  //       snackBarMessage: {
  //         open: true,
  //         variant: 'success',
  //         message: 'Changes saved.',
  //         vertical: 'bottom',
  //         horizontal: 'right',
  //         autoHideDuration: 5000,
  //       },
  //     });
  //   }, 2 * 1000);
  // }

  render() {
    return <Snackbar {...this.props} />;
  }
}

SnackbarContainer.propTypes = {
  doSetTmuiProp: PropTypes.any.isRequired,
};

export { SnackbarContainer };
export default SnackbarContainer;
