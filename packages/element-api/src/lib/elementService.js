const element = require('@transmute/element-lib');
const { getBasePath, getBaseConfig } = require('../config');

const config = getBaseConfig();

const batchService = require('./batchService');

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

  // TODO: Fix batch processing, use max_size, etc...
  batchService.addOp(encodedOperation);

  setTimeout(async () => {
    const batchFile = await batchService.getBatchFile();
    if (batchFile.operations && batchFile.operations.length) {
      element.func.operationsToTransaction({
        operations: [...batchFile.operations],
        storage,
        blockchain,
      });
      batchService.deleteBatchFile();
    }
  }, parseInt(config.sidetree.batch_interval_in_seconds, 10) * 1000);
  return true;
};

const resolve = async (arg) => {
  let did;
  if (arg.indexOf('did:') === -1) {
    const calcDid = element.func.payloadToHash(element.func.decodeJson(arg));
    did = `did:elem:${calcDid}`;
  } else {
    did = arg;
  }

  const doc = await element.func.resolve({
    did,
    transactionTime: config.ethereum.anchor_contract_start_block,
    reducer: element.reducer,
    storage,
    blockchain,
  });
  return doc;
};

// const getAccounts = () => new Promise((resolve, reject) => {
//   blockchain.web3.eth.getAccounts((err, accounts) => {
//     if (err) {
//       return reject(err);
//     }
//     resolve(accounts);
//   });
// });

const getNodeInfo = async () => {
  // make sure we have a contract.
  await blockchain.resolving;
  const accounts = await blockchain.web3.eth.getAccounts();
  const data = await storage.ipfs.version();
  return {
    ipfs: data,
    ethereum: {
      anchor_contract_address: config.ethereum.anchor_contract_address,
      anchor_contract_start_block: config.ethereum.anchor_contract_start_block,
      accounts,
    },
    sidetree: config.sidetree,
  };
};

const getCurrentBatch = async () => batchService.getBatchFile();

const syncAll = async () => {
  const model = await element.func.syncFromBlockNumber({
    transactionTime: config.ethereum.anchor_contract_start_block,
    initialState: {},
    reducer: element.reducer,
    storage,
    blockchain,
  });
  return model;
};

const getRecord = async (did) => {
  const didUniqueSuffix = did.split(':').pop();
  const model = await element.func.syncFromBlockNumber({
    didUniqueSuffixes: [didUniqueSuffix],
    transactionTime: config.ethereum.anchor_contract_start_block,
    initialState: {},
    reducer: element.reducer,
    storage,
    blockchain,
  });
  // eslint-disable-next-line
  return model[didUniqueSuffix];
};

module.exports = {
  getCurrentBatch,
  getNodeInfo,
  getWebFingerRecord,
  processRequest,
  resolve,
  syncAll,
  getRecord,
  storage,
  blockchain,
};
