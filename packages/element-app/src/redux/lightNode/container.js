import { compose } from 'recompose';

import withRedux from './redux';
import withHandlers from './handlers';

import snackbarRedux from '../snackbar/redux';
import sidetreeWallet from '../sidetreeWallet';

export default compose(
  sidetreeWallet.container,
  withRedux,
  snackbarRedux,
  withHandlers
);
