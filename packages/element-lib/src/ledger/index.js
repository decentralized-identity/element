const Web3 = require('web3');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');

const func = require('../func');

const anchorContractArtifact = require('../../build/contracts/SimpleSidetreeAnchor.json');

const anchorContract = contract(anchorContractArtifact);

let anchorContractAddress = '0xDD126A9b05b74aeE06B54587F476eE4271AC79B7';

const generateBIP39Mnemonic = () => bip39.generateMnemonic();

const publicKeyToAddress = (pubKey) => {
  const addr = ethUtil.publicToAddress(Buffer.from(pubKey, 'hex')).toString('hex');
  const address = ethUtil.toChecksumAddress(addr);
  return address;
};

const mnemonicToKeypair = (mnemonic, hdPath) => {
  const seed = bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const addrNode = root.derive(hdPath);
  // eslint-disable-next-line
  const pubKey = ethUtil.privateToPublic(addrNode._privateKey);

  return {
    publicKey: pubKey.toString('hex'),
    // eslint-disable-next-line
    privateKey: addrNode._privateKey.toString('hex'),
  };
};

const getWeb3 = ({ mneumonic, providerUrl }) => {
  const provider = new HDWalletProvider(mneumonic, providerUrl, 0);
  return new Web3(provider);
};

const createNewContract = async () => {
  const web3 = getWeb3({
    mneumonic: process.env.ELEMENT_MNEUMONIC,
    providerUrl: process.env.ELEMENT_PROVIDER,
  });
  const sidetreeNodeKeypair = mnemonicToKeypair(process.env.ELEMENT_MNEUMONIC, "m/44'/60'/0'/0/0");

  const sidetreeNodeAddress = publicKeyToAddress(sidetreeNodeKeypair.publicKey);

  // const [localAddress] = await web3.eth.getAccounts();
  // console.log(localAddress)
  anchorContract.setProvider(web3.currentProvider);
  const newAnchorContract = await anchorContract.new({
    from: sidetreeNodeAddress,
    // TODO: Bad hard coded value, use gasEstimate
    gas: 4712388,
  });
  anchorContractAddress = newAnchorContract.address;
  return newAnchorContract;
};

const getAnchorContract = async () => {
  const web3 = getWeb3({
    mneumonic: process.env.ELEMENT_MNEUMONIC,
    providerUrl: process.env.ELEMENT_PROVIDER,
  });
  try {
    anchorContract.setProvider(web3.currentProvider);
    const instance = await anchorContract.at(anchorContractAddress);
    return instance;
  } catch (e) {
    // console.log(e);
    // we are likely local.
    return createNewContract();
  }
};

const getBlockchainTime = async (blockHashOrBlockNumber) => {
  const web3 = getWeb3({
    mneumonic: process.env.ELEMENT_MNEUMONIC,
    providerUrl: process.env.ELEMENT_PROVIDER,
  });
  const block = await web3.eth.getBlock(blockHashOrBlockNumber);
  const unPrefixedBlockhash = block.hash.replace('0x', '');
  return {
    time: block.number,
    hash: unPrefixedBlockhash,
  };
};

const eventLogToSidetreeTransaction = log => ({
  transactionTime: log.blockNumber,
  transactionTimeHash: log.blockHash,
  transactionNumber: log.args.transactionNumber.toNumber(),
  anchorFileHash: func.bytes32EnodedMultihashToBase58EncodedMultihash(log.args.anchorFileHash),
});

const getTransactions = async (fromBlock) => {
  const instance = await getAnchorContract();
  const logs = await instance.getPastEvents('Anchor', {
    // TODO: add indexing here... https://ethereum.stackexchange.com/questions/8658/what-does-the-indexed-keyword-do
    fromBlock,
    toBlock: 'latest',
  });
  return logs.map(eventLogToSidetreeTransaction);
};

const write = async (anchorFileHash) => {
  const instance = await getAnchorContract();

  const sidetreeNodeKeypair = mnemonicToKeypair(process.env.ELEMENT_MNEUMONIC, "m/44'/60'/0'/0/0");

  const sidetreeNodeAddress = publicKeyToAddress(sidetreeNodeKeypair.publicKey);

  const bytes32EncodedHash = func.base58EncodedMultihashToBytes32(anchorFileHash);
  const receipt = await instance.anchorHash(bytes32EncodedHash, {
    from: sidetreeNodeAddress,
  });

  return eventLogToSidetreeTransaction(receipt.logs[0]);
};

module.exports = {
  createNewContract,
  generateBIP39Mnemonic,
  mnemonicToKeypair,
  write,
  getBlockchainTime,
  getTransactions,
  anchorContractAddress,
};
