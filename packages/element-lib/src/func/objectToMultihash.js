const Unixfs = require('ipfs-unixfs');
const { DAGNode, util } = require('ipld-dag-pb');
const multihashes = require('multihashes');

const objectToUnixFsBuffer = (object) => {
  const objectBuffer = Buffer.from(JSON.stringify(object));
  const unixFs = new Unixfs('file', objectBuffer);
  const unixFsFileBuffer = unixFs.marshal();
  return unixFsFileBuffer;
};

module.exports = async (object) => {
  const unixFsFileBuffer = objectToUnixFsBuffer(object);
  return new Promise((resolve, reject) => {
    DAGNode.create(unixFsFileBuffer, (createErr, node1) => {
      if (createErr) {
        reject(createErr);
      }
      util.cid(node1, (err, cid) => {
        if (err) {
          reject(err);
        }
        resolve(multihashes.toB58String(cid.multihash));
      });
    });
  });
};
