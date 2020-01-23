import { compose } from 'recompose';

import withRedux from './redux';
import withHandlers from './handlers';

import tmui from '../tmui';
import sidetreeWallet from '../sidetreeWallet';

export default compose(
  tmui.container,
  sidetreeWallet.container,

  withRedux,
  withHandlers
);
