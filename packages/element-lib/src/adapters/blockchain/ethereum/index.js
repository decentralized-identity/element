const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const contract = require('@truffle/contract');
const bytes32EnodedMultihashToBase58EncodedMultihash = require('../../../func/bytes32EnodedMultihashToBase58EncodedMultihash');
const base58EncodedMultihashToBytes32 = require('../../../func/base58EncodedMultihashToBytes32');
const anchorContractArtifact = require('../../../../SimpleSidetreeAnchor.json');

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
    hdPathWithoutAccountIndex,
  );
  return new Web3(provider);
};

const eventLogToSidetreeTransaction = log => ({
  transactionTime: log.blockNumber,
  transactionTimeHash: log.blockHash,
  transactionHash: log.transactionHash,
  transactionNumber: log.args.transactionNumber.toNumber(),
  anchorFileHash: bytes32EnodedMultihashToBase58EncodedMultihash(log.args.anchorFileHash),
});

const getAccounts = web3 => new Promise((resolve, reject) => {
  web3.eth.getAccounts((err, accounts) => {
    if (err) {
      reject(err);
    }
    resolve(accounts);
  });
});

class EthereumBlockchain {
  constructor(web3, contractAddress) {
    this.web3 = web3;

    this.anchorContract = contract(anchorContractArtifact);
    this.anchorContract.setProvider(this.web3.currentProvider);

    if (contractAddress) {
      this.anchorContractAddress = contractAddress;
    } else {
      this.resolving = this.createNewContract().then(() => {
        this.anchorContract.setProvider(this.web3.currentProvider);
      });
    }
  }

  async extendSidetreeTransactionWithTimestamp(txns) {
    return Promise.all(
      txns.map(async txn => ({
        ...txn,
        transactionTimestamp: (await this.getBlockchainTime(txn.transactionTime)).timestamp,
      })),
    );
  }

  async close() {
    await this.resolving;
    await this.web3.currentProvider.engine.stop();
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async retryWithLatestTransactionCount(method, args, options, maxRetries = 5) {
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
            (await this.web3.eth.getTransactionCount(options.from, 'pending')) + tryCount - 1,
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
  }

  async createNewContract(fromAddress) {
    if (!fromAddress) {
      // eslint-disable-next-line
      [fromAddress] = await getAccounts(this.web3);
    }

    const instance = await this.retryWithLatestTransactionCount(this.anchorContract.new, [], {
      from: fromAddress,
      // TODO: Bad hard coded value, use gasEstimate
      gas: 4712388,
    });

    this.anchorContractAddress = instance.address;
    return instance;
  }

  async getInstance() {
    if (!this.instance) {
      this.instance = await this.anchorContract.at(this.anchorContractAddress);
    }
    return this.instance;
  }

  async getTransactions(fromBlock, toBlock, options) {
    const instance = await this.getInstance();
    const logs = await instance.getPastEvents('Anchor', {
      // TODO: add indexing here...
      // https://ethereum.stackexchange.com/questions/8658/what-does-the-indexed-keyword-do
      fromBlock,
      toBlock: toBlock || 'latest',
    });
    const txns = logs.map(eventLogToSidetreeTransaction);
    if (options && options.omitTimestamp) {
      return txns;
    }
    return this.extendSidetreeTransactionWithTimestamp(txns);
  }

  async getTransaction(transactionHash) {
    const transaction = await new Promise((resolve, reject) => {
      this.web3.eth.getTransaction(transactionHash, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
    return transaction;
  }

  async getBlockchainTime(blockHashOrBlockNumber) {
    const block = await new Promise((resolve, reject) => {
      this.web3.eth.getBlock(blockHashOrBlockNumber, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
    const unPrefixedBlockhash = block.hash.replace('0x', '');
    return {
      time: block.number,
      timestamp: block.timestamp,
      hash: unPrefixedBlockhash,
    };
  }

  async getCurrentTime() {
    return this.getBlockchainTime('latest');
  }

  async write(anchorFileHash) {
    await this.resolving;
    const [from] = await getAccounts(this.web3);
    const instance = await this.getInstance();
    const bytes32EncodedHash = base58EncodedMultihashToBytes32(anchorFileHash);
    try {
      const receipt = await this.retryWithLatestTransactionCount(
        instance.anchorHash,
        [bytes32EncodedHash],
        {
          from,
          gasPrice: '100000000000',
        },
      );
      return eventLogToSidetreeTransaction(receipt.logs[0]);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

const configure = ({
  mnemonic, hdPath, providerUrl, anchorContractAddress,
}) => {
  const web3 = getWeb3({ mnemonic, hdPath, providerUrl });
  return new EthereumBlockchain(web3, anchorContractAddress);
};

module.exports = {
  configure,
};
