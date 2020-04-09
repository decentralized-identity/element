const ipfsClient = require('ipfs-http-client');

// https://italonascimento.github.io/applying-a-timeout-to-your-promises/
const resolveValueOrNullInSeconds = (promise, seconds) => {
  const timeout = new Promise(resolve => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve(null);
    }, seconds * 1000);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};

class IpfsStorage {
  constructor(multiaddr) {
    const parts = multiaddr.split('/');

    if (parts[1] === 'ip4') {
      this.ipfs = ipfsClient({ host: parts[2], port: parts[4] });
    }

    if (parts[1] === 'dns4') {
      this.ipfs = ipfsClient({
        host: parts[2],
        port: parts[4],
        protocol: parts[5],
      });
    }
    this.logger = console;
  }

  close() {
    return this;
  }

  async write(object) {
    const [node] = await this.ipfs.add(Buffer.from(JSON.stringify(object)));
    return node.hash;
  }

  async read(cid) {
    try {
      const [node] = await resolveValueOrNullInSeconds(this.ipfs.get(cid), 5);
      return JSON.parse(node.content);
    } catch (e) {
      throw new Error(`Invalid JSON: https://ipfs.io/ipfs/${cid}`);
    }
  }
}

const configure = ({ multiaddr }) => new IpfsStorage(multiaddr);

module.exports = {
  configure,
};
