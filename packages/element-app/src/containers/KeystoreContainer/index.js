import React from 'react';
import { compose } from 'redux';

import tmui from '../../redux/tmui';
import keystore from '../../redux/keystore';

import KeystoreContainer from './KeystoreContainer';

const container = compose(
  tmui.container,
  keystore.container
);

export default container(props => <KeystoreContainer {...props} />);
