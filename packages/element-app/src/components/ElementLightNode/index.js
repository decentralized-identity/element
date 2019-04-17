import { compose } from 'recompose';

import ElementLightNode from './ElementLightNode';

import wallet from '../../redux/wallet';
import ligthNode from '../../redux/lightNode';

export default compose(
  wallet.container,
  ligthNode.container,
)(ElementLightNode);
