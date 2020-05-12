/* eslint-disable no-underscore-dangle */
const contract = require('@truffle/contract');
const { base58EncodedMultihashToBytes32 } = require('../../../func');
const anchorContractArtifact = require('../../../../SimpleSidetreeAnchor.json');
const utils = require('./utils');

class EthereumBlockchain {
  constructor(web3, contractAddress) {
    this.web3 = web3;

    this.anchorContract = contract(anchorContractArtifact);
    this.anchorContract.setProvider(this.web3.currentProvider);

    if (contractAddress) {
      this.anchorContractAddress = contractAddress;
    } else {
      this.resolving = this._createNewContract().then(() => {
        this.anchorContract.setProvider(this.web3.currentProvider);
      });
    }
    this.logger = console;
    this.startBlock = 0;
  }

  async extendSidetreeTransactionWithTimestamp(txns) {
    return Promise.all(
      txns.map(async txn => {
        const timestamp = await utils.getBlockchainTime(
          this.web3,
          txn.transactionTime
        );
        return {
          ...txn,
          transactionTimestamp: timestamp,
        };
      })
    );
  }

  async close() {
    await this.resolving;
    await this.web3.currentProvider.engine.stop();
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async getTransactions(fromBlock, toBlock, options) {
    const instance = await this._getInstance();
    const logs = await instance.getPastEvents('Anchor', {
      // TODO: add indexing here...
      // https://ethereum.stackexchange.com/questions/8658/what-does-the-indexed-keyword-do
      fromBlock,
      toBlock: toBlock || 'latest',
    });
    const txns = logs.map(utils.eventLogToSidetreeTransaction);
    if (options && options.omitTimestamp) {
      return txns;
    }
    return this.extendSidetreeTransactionWithTimestamp(txns);
  }

  async getTransactionsBlockNumber(transactionHash) {
    const transaction = await new Promise((resolve, reject) => {
      this.web3.eth.getTransaction(transactionHash, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
    return transaction.blockNumber;
  }

  async write(anchorFileHash) {
    await this.resolving;
    const [from] = await utils.getAccounts(this.web3);
    const instance = await this._getInstance();
    const bytes32EncodedHash = base58EncodedMultihashToBytes32(anchorFileHash);
    try {
      const receipt = await utils.retryWithLatestTransactionCount(
        this.web3,
        instance.anchorHash,
        [bytes32EncodedHash],
        {
          from,
          gasPrice: '100000000000',
        }
      );
      return utils.eventLogToSidetreeTransaction(receipt.logs[0]);
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }

  async getBlockchainHeight() {
    const height = await new Promise((resolve, reject) => {
      this.web3.eth.getBlockNumber((err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
    return height;
  }

  async _getInstance() {
    if (!this.instance) {
      this.instance = await this.anchorContract.at(this.anchorContractAddress);
    }
    return this.instance;
  }

  async _createNewContract(fromAddress) {
    const from = fromAddress || (await utils.getAccounts(this.web3))[0];
    const instance = await utils.retryWithLatestTransactionCount(
      this.web3,
      this.anchorContract.new,
      [],
      {
        from,
        // TODO: Bad hard coded value, use gasEstimate
        gas: 4712388,
      }
    );
    this.anchorContractAddress = instance.address;
    return instance;
  }
}

const configure = ({
  mnemonic,
  hdPath,
  providerUrl,
  anchorContractAddress,
}) => {
  const web3 = utils.getWeb3({ mnemonic, hdPath, providerUrl });
  return new EthereumBlockchain(web3, anchorContractAddress);
};

module.exports = {
  configure,
};
