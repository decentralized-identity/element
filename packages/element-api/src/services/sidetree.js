const element = require('@transmute/element-lib');
const ElementFirestoreAdapter = require('@transmute/element-adapter-firestore');

const { getBaseConfig } = require('../config');

const config = getBaseConfig();

const db = new ElementFirestoreAdapter({
  name: 'element-pouchdb.element-app',
  firebaseAppConfig: {
    apiKey: 'AIzaSyB9W9Z5lk0CJKLKuZ5s6gcJ7i1IWZK5wrg',
    authDomain: 'element-did.firebaseapp.com',
    databaseURL: 'https://element-did.firebaseio.com',
    projectId: 'element-did',
    storageBucket: 'element-did.appspot.com',
    messagingSenderId: '652808307972',
    appId: '1:652808307972:web:0851286d6827d05c',
  },
});

db.signInAnonymously();


const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

const blockchain = element.blockchain.ethereum.configure({
  mnemonic: config.ethereum.mnemonic,
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: config.ethereum.provider_url,
  anchorContractAddress: config.ethereum.anchor_contract_address,
});


const storage = element.storage.ipfs.configure({
  multiaddr: config.ipfs.multiaddr,
});

const sidetree = new element.Sidetree({
  blockchain,
  storage,
  serviceBus,
  db,
  config: {
    BAD_STORAGE_HASH_DELAY_SECONDS: 10, // 10 seconds
    VERBOSITY: 1,
  },
});

const getSidetree = async () => {
  
  await blockchain.resolving;
  return sidetree;
};

module.exports = {
  sidetree,
  getSidetree,
};
