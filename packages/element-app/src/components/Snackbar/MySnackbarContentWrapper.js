import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';

import IconButton from '@material-ui/core/IconButton';

import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/core/styles';

// import { red, yellow, green, blue } from '@material-ui/core/colors';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
  default: InfoIcon,
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: '#48caca', // green[600],
  },
  error: {
    backgroundColor: '#ff605d', // red[600],
  },
  info: {
    backgroundColor: '#2cb3d9', // blue[600],
  },
  warning: {
    backgroundColor: '#fcb373', // yellow[600],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function MySnackbarContentWrapper(props) {
  const classes = useStyles1();
  const { className, message, onClose, variant, ...other } = props;
  // eslint-disable-next-line
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      // eslint-disable-next-line
      className={clsx(classes[variant], className)}
      aria-describedby="toast-area"
      message={
        <span id="toast-area" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="close"
          color="inherit"
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['error', 'info', 'success', 'warning', 'default'])
    .isRequired,
};

export { MySnackbarContentWrapper };
export default MySnackbarContentWrapper;
