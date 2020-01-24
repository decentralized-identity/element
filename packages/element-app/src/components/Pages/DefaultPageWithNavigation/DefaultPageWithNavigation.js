import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { AppBar, Pages } from '../../index';

import SnackbarContainer from '../../../containers/SnackbarContainer';

class DefaultPageWithNavigation extends Component {
  render() {
    const { children } = this.props;
    return (
      <Pages.Default>
        <AppBar>{children}</AppBar>
        <SnackbarContainer />
      </Pages.Default>
    );
  }
}

DefaultPageWithNavigation.propTypes = {
  children: PropTypes.any.isRequired,
};

export default DefaultPageWithNavigation;
