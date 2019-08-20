const fs = require('fs');
const path = require('path');
const firebaseAdmin = require('firebase-admin');
const functions = require('firebase-functions');
// Required for side-effects
require('firebase/firestore');

let serviceAccountKey = false;
const serviceAccountPath = path.resolve(
  __dirname,
  '../../element-did-firebase-adminsdk.json',
);
// eslint-disable-next-line security/detect-non-literal-fs-filename
if (fs.existsSync(serviceAccountPath)) {
  // TODO
  // eslint-disable-next-line
  serviceAccountKey = require(serviceAccountPath);
}
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: serviceAccountKey
      ? firebaseAdmin.credential.cert(serviceAccountKey)
      : firebaseAdmin.credential.applicationDefault(),
    databaseURL: 'https://element-did.firebaseio.com',
  });
}

const authAdmin = firebaseAdmin.auth();
const firestore = firebaseAdmin.firestore();

const teardown = async () => {
  firebaseAdmin.app().delete();
};

module.exports = {
  firebaseAdmin,
  authAdmin,
  functions,
  firestore,
  teardown,
};
