import React from 'react';
import { compose } from 'redux';

import tmui from '../../redux/tmui';

import SnackbarContainer from './SnackbarContainer';

const container = compose(tmui.container);

export default container(props => <SnackbarContainer {...props} />);
