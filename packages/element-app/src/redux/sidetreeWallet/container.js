import { compose } from 'recompose';

import withSidetreeHandlers from './handlers';
import keystore from '../keystore';

export default compose(
  keystore.container,
  withSidetreeHandlers
);
