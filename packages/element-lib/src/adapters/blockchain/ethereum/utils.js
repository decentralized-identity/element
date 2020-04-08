const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const {
  bytes32EnodedMultihashToBase58EncodedMultihash,
} = require('../../../func');

const getWeb3 = ({ mnemonic, hdPath, providerUrl }) => {
  // eslint-disable-next-line
  if (typeof window !== 'undefined' && window.web3) {
    // eslint-disable-next-line
    return window.web3;
  }
  const parts = hdPath.split('/');
  const accountIndex = parseInt(parts.pop(), 10);
  const hdPathWithoutAccountIndex = `${parts.join('/')}/`;
  const provider = new HDWalletProvider(
    mnemonic,
    providerUrl,
    accountIndex,
    1,
    hdPathWithoutAccountIndex
  );
  return new Web3(provider);
};

const getAccounts = web3 =>
  new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        reject(err);
      }
      resolve(accounts);
    });
  });

const eventLogToSidetreeTransaction = log => ({
  transactionTime: log.blockNumber,
  transactionTimeHash: log.blockHash,
  transactionHash: log.transactionHash,
  transactionNumber: log.args.transactionNumber.toNumber(),
  anchorFileHash: bytes32EnodedMultihashToBase58EncodedMultihash(
    log.args.anchorFileHash
  ),
});

const retryWithLatestTransactionCount = async (
  web3,
  method,
  args,
  options,
  maxRetries = 5
) => {
  let tryCount = 0;
  const errors = [];
  try {
    return await method(...args, {
      ...options,
    });
  } catch (e) {
    errors.push(`${e}`);
    tryCount += 1;
  }
  while (tryCount < maxRetries) {
    try {
      return method(...args, {
        ...options,
        nonce:
          // eslint-disable-next-line
          (await web3.eth.getTransactionCount(options.from, 'pending')) +
          tryCount -
          1,
      });
    } catch (e) {
      errors.push(`${e}`);
      tryCount += 1;
    }
  }
  throw new Error(`
    Could not use method: ${method}.
    Most likely reason is invalid nonce.
    See https://ethereum.stackexchange.com/questions/2527

    This interface uses web3, and cannot be parallelized. 
    Consider using a different HD Path for each node / service / instance.

    ${JSON.stringify(errors, null, 2)}
    `);
};

const getBlockchainTime = async (web3, blockHashOrBlockNumber) => {
  const block = await new Promise((resolve, reject) => {
    web3.eth.getBlock(blockHashOrBlockNumber, (err, b) => {
      if (err) {
        reject(err);
      }
      resolve(b);
    });
  });
  if (block) {
    return block.timestamp;
  }
  return null;
};

module.exports = {
  getWeb3,
  getAccounts,
  eventLogToSidetreeTransaction,
  retryWithLatestTransactionCount,
  getBlockchainTime,
};
