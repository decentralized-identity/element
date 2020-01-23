import { compose } from 'recompose';

import withRedux from './redux';
import withHandlers from './handlers';

import sidetreeWallet from '../sidetreeWallet';
import tmui from '../tmui';

export default compose(
  tmui.container,
  sidetreeWallet.container,

  withRedux,
  withHandlers
);
