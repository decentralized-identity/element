import { compose } from 'recompose';

import withSidetreeHandlers from './handlers';
import wallet from '../wallet';

export default compose(
  wallet.container,
  withSidetreeHandlers
);
