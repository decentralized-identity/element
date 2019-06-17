const fs = require('fs');
const path = require('path');
const firebase = require('firebase');

const firebaseAdmin = require('firebase-admin');
const firebaseFunctions = require('firebase-functions');
// Required for side-effects
require('firebase/firestore');

const config = {
  apiKey: 'AIzaSyB9W9Z5lk0CJKLKuZ5s6gcJ7i1IWZK5wrg',
  authDomain: 'element-did.firebaseapp.com',
  databaseURL: 'https://element-did.firebaseio.com',
  projectId: 'element-did',
  storageBucket: '',
  messagingSenderId: '652808307972',
};

let serviceAccountKey = false;
const serviceAccountPath = path.resolve(
  __dirname,
  '../../element-did-firebase-adminsdk-oqgpz-08625dd272.json',
);
// eslint-disable-next-line security/detect-non-literal-fs-filename
if (fs.existsSync(serviceAccountPath)) {
  /* eslint-disable max-len */
  // eslint-disable-next-line import/no-dynamic-require,global-require,security/detect-non-literal-require
  serviceAccountKey = require(serviceAccountPath);
}
if (!firebase.apps.length) {
  // config for logging in with email/password
  firebase.initializeApp(config);
  // config for verifying an existing access token
  firebaseAdmin.initializeApp({
    credential: serviceAccountKey
      ? firebaseAdmin.credential.cert(serviceAccountKey)
      : firebaseAdmin.credential.applicationDefault(),
    databaseURL: config.databaseURL,
  });
}

const auth = firebase.auth();
const authAdmin = firebaseAdmin.auth();
const db = firebaseAdmin.database();

const teardown = async () => {
  firebase.app('[DEFAULT]').delete();
  firebaseAdmin.app().delete();
};

module.exports = {
  firebase,
  firebaseAdmin,
  auth,
  authAdmin,
  db,
  functions: firebaseFunctions,
  teardown,
};
