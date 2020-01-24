import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import storage from 'redux-persist/lib/storage';

import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import lightNode from '../lightNode';
import fullNode from '../fullNode';
import tmui from '../tmui';
import keystore from '../keystore';

export const history = createBrowserHistory();

const rootReducer = {
  lightNode: lightNode.reducer,
  fullNode: fullNode.reducer,
  tmui: tmui.reducer,
  keystore: keystore.reducer,
  router: connectRouter(history),
};

export default appReducers => {
  // Persistance configuration
  const persistConfig = {
    key: 'elementDID',
    whitelist: ['keystore'],
    storage,
  };

  // Store.

  const reducers = combineReducers({ ...rootReducer, ...appReducers });
  const store = createStore(
    persistReducer(persistConfig, reducers),
    composeWithDevTools(applyMiddleware(thunk, routerMiddleware(history)))
  );

  // Persistor.
  const persistor = persistStore(store);
  return {
    store,
    persistor,
    history,
  };
};
