const ipfsClient = require('ipfs-http-client');

class IpfsStorage {
  constructor(multiaddr) {
    this.ipfs = ipfsClient(multiaddr);
  }

  async write(object) {
    const [node] = await this.ipfs.add(Buffer.from(JSON.stringify(object)));
    return node.hash;
  }

  async read(cid) {
    const [node] = await this.ipfs.get(cid);
    return JSON.parse(node.content);
  }
}

const configure = ({ multiaddr }) => new IpfsStorage(multiaddr);

module.exports = {
  configure,
};
