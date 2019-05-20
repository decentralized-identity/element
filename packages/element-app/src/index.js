import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import { Route, Switch } from 'react-router'; // react-router v4
import { ConnectedRouter } from 'connected-react-router';
import * as serviceWorker from './serviceWorker';
import createStore from './redux/store';

import * as Pages from './pages';

const { store, persistor, history } = createStore();

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <ConnectedRouter history={history}>
              <Switch>
                <Route exact path="/" render={() => <Pages.Landing />} />
                <Route exact path="/wallet" render={() => <Pages.Wallet />} />
                <Route exact path="/dapp/did/profile" render={() => <Pages.DAppMyDIDPage />} />

                <Route exact path="/dapp/resolver" render={() => <Pages.DAppDIDResolverPage />} />
                <Route exact path="/dapp/did/all" render={() => <Pages.DAppDIDViewAllPAge />} />
                <Route
                  exact
                  path="/dapp/resolver/:did"
                  render={() => <Pages.DAppDIDResolverPage />}
                />
                <Route exact path="/credits" render={() => <Pages.Credits />} />

                <Route path="*" render={() => <Pages.NotFound />} />
                {/* <Route exact path="/wallet" render={() => <Pages.Wallet />} />
                <Route exact path="/light-node" render={() => <Pages.LightNode />} />
                <Route exact path="/dapp" render={() => <Pages.LightNode />} />
                <Route exact path="/full-node" render={() => <Pages.FullNode />} />
                 <Route path="/sign/:base64EncodedJsonLd" render={() => <Pages.Sign />} />
                <Route path="/verify/:base64EncodedJsonLd" render={() => <Pages.Verify />} />
                <Route path="/encrypt/:base64EncodedJsonLd" render={() => <Pages.Encrypt />} />
                <Route path="/decrypt/:base64EncodedJsonLd" render={() => <Pages.Decrypt />} />

                */}
              </Switch>
            </ConnectedRouter>
          </PersistGate>
        </Provider>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
