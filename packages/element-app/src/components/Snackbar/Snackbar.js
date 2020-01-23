import React from "react";
import PropTypes from "prop-types";

import Snackbar from "@material-ui/core/Snackbar";

import MySnackbarContentWrapper from "./MySnackbarContentWrapper";

function TSnackbar(props) {
  const {
    open,
    variant,
    message,
    autoHideDuration,
    vertical,
    horizontal
  } = props.tmui.snackBarMessage || {
    variant: "default",
    vertical: "bottom",
    horizontal: "right"
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    props.doSetTmuiProp({
      snackBarMessage: {
        ...props.tmui.snackBarMessage,
        open: false
      }
    });
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical,
          horizontal
        }}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
      >
        <MySnackbarContentWrapper
          onClose={handleClose}
          variant={variant}
          message={message}
        />
      </Snackbar>
    </div>
  );
}

TSnackbar.propTypes = {
  tmui: PropTypes.object.isRequired,
  doSetTmuiProp: PropTypes.func.isRequired
};

export { TSnackbar as Snackbar };
export default TSnackbar;
