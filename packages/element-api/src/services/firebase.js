/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');
const path = require('path');
const firebaseAdmin = require('firebase-admin');
// Required for side-effects
require('firebase/firestore');

let serviceAccountKey = false;
const serviceAccountPath = path.resolve(
  __dirname,
  '../../element-did-firebase-adminsdk.json',
);

if (fs.existsSync(serviceAccountPath)) {
  serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath));
}
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: serviceAccountKey
      ? firebaseAdmin.credential.cert(serviceAccountKey)
      : firebaseAdmin.credential.applicationDefault(),
    databaseURL: 'https://element-did.firebaseio.com',
  });
}

const firestore = firebaseAdmin.firestore();

module.exports = {
  firestore,
};
