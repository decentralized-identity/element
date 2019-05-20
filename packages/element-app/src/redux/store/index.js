import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import storage from 'redux-persist/lib/storage';

import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import snackbar from '../snackbar';
import wallet from '../wallet';
import lightNode from '../lightNode';
import fullNode from '../fullNode';

export const history = createBrowserHistory();

const rootReducer = {
  lightNode: lightNode.reducer,
  fullNode: fullNode.reducer,
  snackbar: snackbar.reducer,
  wallet: wallet.reducer,
  router: connectRouter(history),
};

export default (appReducers) => {
  // Persistance configuration
  const persistConfig = {
    key: 'elementDID',
    whitelist: ['wallet'],
    storage,
  };

  // Store.

  const reducers = combineReducers({ ...rootReducer, ...appReducers });
  const store = createStore(
    persistReducer(persistConfig, reducers),
    composeWithDevTools(applyMiddleware(thunk, routerMiddleware(history))),
  );

  // Persistor.
  const persistor = persistStore(store);
  return {
    store,
    persistor,
    history,
  };
};
