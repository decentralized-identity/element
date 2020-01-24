import React from 'react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

import loadingGif from './transmute-loading-white.gif';

function Loading({ message }) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <img
        alt="transmute loading..."
        src={loadingGif}
        style={{
          // filter: 'brightness(25%) sepia(1) hue-rotate(-150deg)',
          marginBottom: '32px',
        }}
      />
      <Typography paragraph>{message || 'Loading...'}</Typography>
    </div>
  );
}

Loading.propTypes = {
  message: PropTypes.string,
};

export { Loading };
export default Loading;
