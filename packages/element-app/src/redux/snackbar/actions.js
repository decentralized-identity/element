import { createAction } from 'redux-actions';

export const snackbarMessage = createAction(
  'snackbar/MESSAGE',
  // eslint-disable-next-line no-shadow
  ({ snackbarMessage }) => ({
    snackbarMessage,
  })
);
