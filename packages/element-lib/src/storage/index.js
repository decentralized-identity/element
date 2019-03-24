const ipfsClient = require('ipfs-http-client');

const write = async (object) => {
  const ipfs = ipfsClient(process.env.ELEMENT_IPFS_MULTIADDR);
  const [node] = await ipfs.add(Buffer.from(JSON.stringify(object)));
  return node.hash;
};

const read = async (cid) => {
  const ipfs = ipfsClient(process.env.ELEMENT_IPFS_MULTIADDR);
  const [node] = await ipfs.get(cid);
  return JSON.parse(node.content);
};

module.exports = {
  write,
  read,
};
