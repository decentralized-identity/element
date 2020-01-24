import { handleActions } from 'redux-actions';
import { setKeystoreProp } from './actions';

const initialState = {};

export default handleActions(
  {
    [setKeystoreProp]: (state, { payload }) => ({ ...state, ...payload }),
  },
  initialState
);
