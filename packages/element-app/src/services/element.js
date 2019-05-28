import element from '@transmute/element-lib';
import config from '../config';

const START_BLOCK = 5650892;

export const blockchain = element.blockchain.ethereum.configure({
  anchorContractAddress: config.ELEMENT_CONTRACT_ADDRESS,
});

export const storage = element.storage.ipfs.configure({
  multiaddr: config.ELEMENT_IPFS_MULTIADDR,
});

// // eslint-disable-next-line
// const getItem = id => JSON.parse(localStorage.getItem(id));

// const setItem = (id, value) => {
//   // eslint-disable-next-line
//   localStorage.setItem(id, JSON.stringify(value));
//   return value;
// };

// const cache = {
//   getItem,
//   setItem,
// };

export const createDefaultDIDPayload = (wallet) => {
  const keypair = Object.values(wallet.data.keys)[0];
  const payload = {
    '@context': 'https://w3id.org/did/v1',
    publicKey: [
      {
        id: '#key1',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: keypair.publicKey,
      },
    ],
    service: [
      // {
      //   id: '#transmute.element.light-node',
      //   type: 'Transmute.Element.LightNode',
      //   serviceEndpoint: `${window.location.href}#default`,
      // },
    ],
  };
  return payload;
};

export const walletToDID = (wallet) => {
  const payload = createDefaultDIDPayload(wallet);
  const didUniqueSuffix = element.func.payloadToHash(payload);
  // console.log(JSON.stringify(payload, null, 2))
  return `did:elem:${didUniqueSuffix}`;
};

export const createDefaultDIDOperation = async (wallet) => {
  const keypair = Object.values(wallet.data.keys)[0];
  const payload = createDefaultDIDPayload(wallet);
  const operation = await element.func.payloadToOperation({
    type: 'create',
    kid: '#key1',
    payload,
    privateKey: keypair.privateKey,
  });
  return operation;
};

export const createDefaultDID = async (wallet) => {
  const op = await createDefaultDIDOperation(wallet);
  const tx = await element.func.operationsToTransaction({
    operations: [op],
    storage,
    blockchain,
  });
  return tx;
};

export const resolveDID = async (did) => {
  const doc = await element.func.resolve({
    did,
    transactionTime: START_BLOCK,
    reducer: element.reducer,
    storage,
    blockchain,
  });
  return doc;
};

export const syncAll = async () => {
  const model = await element.func.syncFromBlockNumber({
    transactionTime: START_BLOCK,
    initialState: {},
    reducer: element.reducer,
    storage,
    blockchain,
  });
  return model;
};

export const addKeyPayload = (record, key) => {
  const didUniqueSuffix = record.doc.id.split(':').pop();
  const payload = {
    didUniqueSuffix,
    previousOperationHash: record.previousOperationHash,
    patch: [
      {
        op: 'replace',
        path: `/publicKey/${record.doc.publicKey.length}`,
        value: {
          id: `#kid=${key.kid}`,
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: key.publicKey,
        },
      },
    ],
  };
  return payload;
};

export const removeKeyPayload = (record, key) => {
  const didUniqueSuffix = record.doc.id.split(':').pop();
  const keyIndex = record.doc.publicKey.map(k => k.publicKeyHex).indexOf(key.publicKey);
  const payload = {
    didUniqueSuffix,
    previousOperationHash: record.previousOperationHash,
    patch: [
      {
        op: 'remove',
        path: `/publicKey/${keyIndex}`,
      },
    ],
  };
  return payload;
};

export const addKeyToDIDDocument = async (wallet, key) => {
  const defaultDID = walletToDID(wallet);
  const didUniqueSuffix = defaultDID.split(':').pop();

  const model = await element.func.syncFromBlockNumber({
    didUniqueSuffixes: [didUniqueSuffix],
    transactionTime: START_BLOCK,
    initialState: {},
    reducer: element.reducer,
    storage,
    blockchain,
  });
  const record = model[didUniqueSuffix];
  const payload = addKeyPayload(record, key);
  const firstKey = Object.keys(wallet.data.keys)[0];
  const operation = await element.func.payloadToOperation({
    type: 'update',
    kid: '#key1',
    payload,
    privateKey: wallet.data.keys[firstKey].privateKey,
  });
  const tx = await element.func.operationsToTransaction({
    operations: [operation],
    storage,
    blockchain,
  });
  return tx;
};

export const removeKeyFromDIDDocument = async (wallet, key) => {
  const defaultDID = walletToDID(wallet);
  const didUniqueSuffix = defaultDID.split(':').pop();

  const model = await element.func.syncFromBlockNumber({
    didUniqueSuffixes: [didUniqueSuffix],
    transactionTime: START_BLOCK,
    initialState: {},
    reducer: element.reducer,
    storage,
    blockchain,
  });
  const record = model[didUniqueSuffix];
  const keyIndex = record.doc.publicKey.map(k => k.publicKeyHex).indexOf(key.publicKey);
  const payload = {
    didUniqueSuffix,
    previousOperationHash: record.previousOperationHash,
    patch: [
      {
        op: 'remove',
        path: `/publicKey/${keyIndex}`,
      },
    ],
  };
  const firstKey = Object.keys(wallet.data.keys)[0];
  const operation = await element.func.payloadToOperation({
    type: 'update',
    kid: '#key1',
    payload,
    privateKey: wallet.data.keys[firstKey].privateKey,
  });
  const tx = await element.func.operationsToTransaction({
    operations: [operation],
    storage,
    blockchain,
  });
  return tx;
};
