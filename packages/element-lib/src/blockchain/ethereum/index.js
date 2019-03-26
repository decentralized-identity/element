const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');

const bytes32EnodedMultihashToBase58EncodedMultihash = require('../../func/bytes32EnodedMultihashToBase58EncodedMultihash');
const base58EncodedMultihashToBytes32 = require('../../func/base58EncodedMultihashToBytes32');

const anchorContractArtifact = require('../../../build/contracts/SimpleSidetreeAnchor.json');

const getWeb3 = ({ mneumonic, hdPath, providerUrl }) => {
  // eslint-disable-next-line
  if (typeof window !== 'undefined' && window.web3) {
    // eslint-disable-next-line
    return window.web3;
  }
  const provider = new HDWalletProvider(mneumonic, providerUrl, 0, 1, hdPath);
  return new Web3(provider);
};

const eventLogToSidetreeTransaction = log => ({
  transactionTime: log.blockNumber,
  transactionTimeHash: log.blockHash,
  transactionNumber: log.args.transactionNumber.toNumber(),
  anchorFileHash: bytes32EnodedMultihashToBase58EncodedMultihash(log.args.anchorFileHash),
});

class EthereumBlockchain {
  constructor(web3, contractAddress) {
    this.web3 = web3;

    this.anchorContract = contract(anchorContractArtifact);
    this.anchorContract.setProvider(this.web3.currentProvider);

    if (contractAddress) {
      this.anchorContractAddress = contractAddress;
    } else {
      // probably local, create a new contract.
      this.resolving = web3.eth.getAccounts().then(accounts => this.createNewContract(accounts[0]));
    }
  }

  async createNewContract(fromAddress) {
    if (!fromAddress) {
      // eslint-disable-next-line
      [fromAddress] = await this.web3.eth.getAccounts();
    }
    const instance = await this.anchorContract.new({
      from: fromAddress,
      // TODO: Bad hard coded value, use gasEstimate
      gas: 4712388,
    });

    this.anchorContractAddress = instance.address;

    return instance;
  }

  async getTransactions(fromBlock) {
    const instance = await this.anchorContract.at(this.anchorContractAddress);
    const logs = await instance.getPastEvents('Anchor', {
      // TODO: add indexing here...
      // https://ethereum.stackexchange.com/questions/8658/what-does-the-indexed-keyword-do
      fromBlock,
      toBlock: 'latest',
    });
    return logs.map(eventLogToSidetreeTransaction);
  }

  async getBlockchainTime(blockHashOrBlockNumber) {
    const block = await this.web3.eth.getBlock(blockHashOrBlockNumber);
    const unPrefixedBlockhash = block.hash.replace('0x', '');
    return {
      time: block.number,
      hash: unPrefixedBlockhash,
    };
  }

  async write(anchorFileHash) {
    const [from] = await this.web3.eth.getAccounts();
    const instance = await this.anchorContract.at(this.anchorContractAddress);
    const bytes32EncodedHash = base58EncodedMultihashToBytes32(anchorFileHash);
    const receipt = await instance.anchorHash(bytes32EncodedHash, {
      from,
    });
    return eventLogToSidetreeTransaction(receipt.logs[0]);
  }
}

const configure = ({
  mneumonic, hdPath, providerUrl, anchorContractAddress,
}) => {
  const web3 = getWeb3({ mneumonic, hdPath, providerUrl });
  return new EthereumBlockchain(web3, anchorContractAddress);
};

module.exports = {
  configure,
};
