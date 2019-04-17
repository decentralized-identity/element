import { compose } from 'recompose';
import ElementFullNode from './ElementFullNode';

import wallet from '../../redux/wallet';
import fullNode from '../../redux/fullNode';

export default compose(
  wallet.container,
  fullNode.container,
)(ElementFullNode);
