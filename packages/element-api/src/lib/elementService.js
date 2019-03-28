const element = require('@transmute/element-lib');
const { getBasePath, getBaseConfig } = require('../config');

const config = getBaseConfig();

if (!config.ethereum.anchor_contract_address) {
  // eslint-disable-next-line
  console.warn('You need to set the anchorFile contract before proceeding.');
  // eslint-disable-next-line
  console.warn(
    "firebase functions:config:set element.ethereum.anchor_contract_address='0x128b72578baf00c9fbF1c4a5b57cd69c61De1dd1'",
  );
}

const blockchain = element.blockchain.ethereum.configure({
  mnemonic: config.ethereum.mnemonic,
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: config.ethereum.provider_url,
  anchorContractAddress: config.ethereum.anchor_contract_address,
});

const storage = element.storage.ipfs.configure({
  multiaddr: config.ipfs.multiaddr,
});

const getWebFingerRecord = async (resource) => {
  const [did, domain] = resource.replace('acct:', '').split('@');
  //   const didDocument = await didLib.resolver.resolve(did);
  //   if (!didDocument) {
  //     throw new Error('Webfinger could not resolve did.');
  //   }
  const result = {
    subject: `acct:${did}@${domain}`,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: `https://${domain}${getBasePath()}/did/${did}`,
      },
    ],
  };
  return result;
};

const processRequest = async ({ header, payload, signature }) => {
  // make sure we have a contract.
  await blockchain.resolving;

  // TODO: in the future, might mutate header with Proof of Work when missing.
  const encodedOperation = element.func.requestBodyToEncodedOperation({
    header,
    payload,
    signature,
  });

  // TODO: just add to the batch, and anchor batch when its full... for now, batchSize of one.
  return element.func.operationsToTransaction({
    operations: [encodedOperation],
    storage,
    blockchain,
  });
};

const resolve = (arg) => {
  let did;
  if (arg.indexOf('did:') === -1) {
    const calcDid = element.func.payloadToHash(element.func.decodeJson(arg));
    did = `did:elem:${calcDid}`;
  } else {
    did = arg;
  }

  return element.func.resolve({
    did,
    cache: element.cache,
    reducer: element.reducer,
    storage,
    blockchain,
  });
};

const getSidetree = async () => {
  const cacheName = 'sidetree.root';
  const cachedState = element.cache.getItem(cacheName);
  // eslint-disable-next-line
  const transactionTime = cachedState.transactionTime ? cachedState.transactionTime : 0; // set from cache
  const updated = await element.func.syncFromBlockNumber({
    transactionTime: transactionTime + 1,
    initialState: cachedState || {}, // set from cache
    reducer: element.reducer,
    storage,
    blockchain,
  });
  element.cache.setItem(cacheName, updated);
  return updated;
};

const getNodeInfo = async () => {
  // make sure we have a contract.
  await blockchain.resolving;
  const ipfs = await storage.ipfs.id();
  return {
    ipfs,
    ethereum: {
      anchorContractAddress: blockchain.anchorContractAddress,
    },
  };
};

module.exports = {
  getNodeInfo,
  getWebFingerRecord,
  processRequest,
  resolve,
  getSidetree,
};
