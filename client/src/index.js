import React from 'react';
import ReactDOM from 'react-dom';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {reducer as form} from 'redux-form';
import {Route, Switch} from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import {ConnectedRouter, connectRouter, routerMiddleware} from 'connected-react-router';
import 'bootstrap/dist/css/bootstrap.css';

import 'font-awesome/css/font-awesome.css';
import * as serviceWorker from './serviceWorker';
// Import your reducers and routes here
import Gamelle from "./Gamelle";
import firebase from 'firebase/app'
import 'firebase/firestore';
import {firebaseReducer, ReactReduxFirebaseProvider} from 'react-redux-firebase'
import {createFirestoreInstance, firestoreReducer} from 'redux-firestore' // <- needed if using firestore


const history = createBrowserHistory();


const firebaseConfig = {
  apiKey: "AIzaSyCGqqXK82-j3aafkE23C32MddGcEFItoLs",
  authDomain: "itescia-iot.firebaseapp.com",
  projectId: "itescia-iot",
  storageBucket: "itescia-iot.appspot.com",
  messagingSenderId: "55028690349",
  appId: "1:55028690349:web:6202ffcdb657574c2d0524"
}

const rrfConfig = {
  userProfile: 'sensors'
  // useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
}
firebase.initializeApp(firebaseConfig)

// Initialize other services on firebase instance
firebase.firestore()


const store = createStore(
  combineReducers({
    router: connectRouter(history),
    form,
    firebase: firebaseReducer,
    firestore: firestoreReducer // <- needed if using firestore
    /* Add your reducers here */
  }),
  applyMiddleware(routerMiddleware(history), thunk)
);

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance // <- needed if using firestore
}
ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/" component={Gamelle} strict={true} exact={true}/>
          {/* Add your routes here */}
          <Route render={() => <h1>Not Found</h1>}/>
        </Switch>
      </ConnectedRouter>
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
