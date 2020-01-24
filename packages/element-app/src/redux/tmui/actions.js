import { createAction } from 'redux-actions';

export const setTmuiProp = createAction(
  'tmui/SET_TMUI_PROP',
  payload => payload
);
