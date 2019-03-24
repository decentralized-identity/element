const ipfsClient = require('ipfs-http-client');

let multiAddr = null;

const write = async (object) => {
  const ipfs = ipfsClient(process.env.ELEMENT_IPFS_MULTIADDR || multiAddr);
  const [node] = await ipfs.add(Buffer.from(JSON.stringify(object)));
  return node.hash;
};

const read = async (cid) => {
  const ipfs = ipfsClient(process.env.ELEMENT_IPFS_MULTIADDR || multiAddr);
  const [node] = await ipfs.get(cid);
  return JSON.parse(node.content);
};

const setMultiAddr = (_multiAddr) => {
  multiAddr = _multiAddr;
};

const getMultiAddr = () => multiAddr;

module.exports = {
  write,
  read,
  setMultiAddr,
  getMultiAddr,
};
