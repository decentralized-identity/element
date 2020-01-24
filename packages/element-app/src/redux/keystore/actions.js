import { createAction } from 'redux-actions';

export const setKeystoreProp = createAction(
  'keystore/SET_KEYSTORE_PROP',
  payload => payload
);
