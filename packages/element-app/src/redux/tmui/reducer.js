import { handleActions } from 'redux-actions';
import { setTmuiProp } from './actions';

const initialState = {
  isPrimaryDrawerOpen: false,
  isSpeedDialogOpen: false,
  activeTabIndex: 0,
};

export default handleActions(
  {
    [setTmuiProp]: (state, { payload }) => ({ ...state, ...payload }),
  },
  initialState
);
