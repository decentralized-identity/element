import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { darken, lighten } from '@material-ui/core/styles/colorManipulator';

const primaryColor = '#594aa8';
const secondaryColor = '#fcb373';

const font1 = '"Rajdhani"';
const font2 = '"Roboto Condensed"';
const font3 = '"Lato"';

const fontWeightLight = 300;
const fontWeightRegular = 400;
const fontWeightMedium = 600;

class Theme extends Component {
  render() {
    const { children } = this.props;
    const theme = createMuiTheme({
      splashImage: '',
      palette: {
        type: 'dark',
        primary: {
          light: lighten(primaryColor, 0.07),
          main: primaryColor,
          dark: darken(primaryColor, 0.07),
        },
        secondary: {
          light: lighten(secondaryColor, 0.07),
          main: secondaryColor,
          dark: darken(secondaryColor, 0.07),
        },
      },
      typography: {
        useNextVariants: true,
        fontSize: 16,
        fontFamily: [font1, font2, font3].join(','),
        h1: {
          fontFamily: font1,
          fontWeight: fontWeightMedium,
        },
        h2: {
          fontFamily: font1,
          fontWeight: fontWeightMedium,
        },
        h3: {
          fontFamily: font1,
          fontWeight: fontWeightMedium,
        },
        h4: {
          fontFamily: font2,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: fontWeightRegular,
        },
        h5: {
          fontFamily: font2,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: fontWeightRegular,
        },
        h6: {
          fontFamily: font2,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: fontWeightRegular,
        },
        subtitle1: {
          fontFamily: font1,
          fontWeight: fontWeightRegular,
        },
        subtitle2: {
          fontFamily: font2,
          fontWeight: fontWeightRegular,
        },
        body1: {
          fontFamily: font3,
          fontWeight: fontWeightRegular,
        },
        body2: {
          fontFamily: font3,
          fontWeight: fontWeightRegular,
        },
        button: {
          fontFamily: font2,
          fontWeight: fontWeightRegular,
        },
        caption: {
          fontFamily: font2,
          fontWeight: fontWeightRegular,
        },
        overline: {
          fontFamily: font2,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: fontWeightLight,
        },
      },

      overrides: {
        MuiInput: {
          // Name of the component ⚛️ / style sheet
          input: {
            fontFamily: font3,
          },
        },
        MuiInputLabel: {
          // Name of the component ⚛️ / style sheet
          root: {
            fontFamily: font2,
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
