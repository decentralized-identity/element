import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { amber, deepPurple } from '@material-ui/core/colors';

class Theme extends Component {
  render() {
    const { children } = this.props;
    const theme = createMuiTheme({
      splashImage: '',
      typography: {
        useNextVariants: true,
        fontFamily: ['"Lato"', '"Helvetica"', '"Arial"', 'sans-serif'].join(','),
        button: {
          fontFamily: ['"Rajdhani"', 'sans-serif'].join(','),
          fontWeight: 700,
        },
        h1: {
          fontFamily: '"Rajdhani"',
          fontWeight: 700,
        },

        h2: {
          fontFamily: '"Rajdhani"',
          fontWeight: 700,
        },
        h3: {
          fontFamily: '"Rajdhani"',
          fontWeight: 700,
        },
        h4: {
          fontFamily: '"Roboto Condensed"',
          fontWeight: 500,
        },
        h5: {
          fontFamily: '"Roboto Condensed"',
          fontWeight: 500,
        },
        h6: {
          fontFamily: '"Lato"',
          fontWeight: 700,
        },
        subtitle1: {
          fontFamily: '"Roboto Condensed"',
          fontWeight: 500,
        },
        subtitle2: {
          fontFamily: '"Roboto Condensed"',
          fontWeight: 500,
        },
        captionNext: {
          fontFamily: '"Roboto Condensed"',
          fontWeight: 500,
        },
        overline: {
          fontFamily: '"Roboto Condensed"',
          fontWeight: 700,
        },
      },
      palette: {
        type: 'dark',
        primary: {
          light: amber[600],
          main: amber[700],
          dark: amber[800],
        },
        secondary: {
          light: deepPurple[300],
          main: deepPurple[400],
          dark: deepPurple[500],
        },
      },
      overrides: {
        MuiInput: {
          // Name of the component ⚛️ / style sheet
          input: {
            fontFamily: '"Roboto Condensed"',
          },
        },
        MuiInputLabel: {
          // Name of the component ⚛️ / style sheet
          root: {
            fontFamily: '"Roboto Condensed"',
          },
        },
        MuiAppBar: {
          root: {
            // boxShadow: 'none',
          },
        },
        MuiButton: {
          // Name of the rule
          contained: {
            boxShadow: 'none',
          },
        },
      },
    });
    return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
  }
}

Theme.propTypes = {
  children: PropTypes.any.isRequired,
};

export default Theme;
