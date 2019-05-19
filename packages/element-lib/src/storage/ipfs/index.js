const ipfsClient = require('ipfs-http-client');

const resolveValueOrNullInSeconds = (promise, seconds) => new Promise(async (resolve, reject) => {
  const maybeNull = setTimeout(() => {
    resolve(null);
  }, seconds * 1000);

  try {
    const value = await promise;
    clearTimeout(maybeNull);
    resolve(value);
  } catch (e) {
    clearTimeout(maybeNull);
    reject(e);
  }
});

class IpfsStorage {
  constructor(multiaddr) {
    const parts = multiaddr.split('/');

    if (parts[1] === 'ip4') {
      this.ipfs = ipfsClient({ host: parts[2], port: parts[4] });
    }

    if (parts[1] === 'dns4') {
      this.ipfs = ipfsClient({ host: parts[2], port: parts[4], protocol: parts[5] });
    }
  }

  async write(object) {
    const [node] = await this.ipfs.add(Buffer.from(JSON.stringify(object)));
    return node.hash;
  }

  async read(cid) {
    const [node] = await resolveValueOrNullInSeconds(this.ipfs.get(cid), 5);
    let parsed = {};
    try {
      parsed = JSON.parse(node.content);
    } catch (e) {
      console.warn(e);
      throw new Error(`Invalid AnchorFile JSON: https://ipfs.io/ipfs/${cid}`);
    }

    return parsed;
  }
}

const configure = ({ multiaddr }) => new IpfsStorage(multiaddr);

module.exports = {
  configure,
};
