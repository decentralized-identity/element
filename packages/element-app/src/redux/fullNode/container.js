import { compose } from 'recompose';

import withRedux from './redux';
import withHandlers from './handlers';

import sidetreeWallet from '../sidetreeWallet';
import snackbarRedux from '../snackbar/redux';

export default compose(
  sidetreeWallet.container,
  withRedux,
  snackbarRedux,
  withHandlers
);
