const path = require('path');
const fs = require('fs');
// eslint-disable-next-line
const proc = require('child_process');

const cwd = process.cwd();
const envAlias = process.argv[2];
const inputFile = process.argv[3];
const outputFile = process.argv[4];

const lastCommit = proc
  .execSync('git rev-parse HEAD')
  .toString()
  .trim();

// eslint-disable-next-line
require('dotenv').config({ path: path.resolve(cwd, inputFile) });

const config = {
  element: {
    commit: lastCommit,
    env: envAlias,
    couchdb_remote: process.env.ELEMENT_COUCHDB_REMOTE,
    ipfs: {
      multiaddr: process.env.ELEMENT_IPFS_MULTIADDR,
    },
    ethereum: {
      anchor_contract_address: process.env.ELEMENT_CONTRACT_ADDRESS,
      provider_url: process.env.ELEMENT_PROVIDER,
      mnemonic: process.env.ELEMENT_MNEMONIC,
    },
  },
};

// eslint-disable-next-line
fs.writeFileSync(path.resolve(cwd, outputFile), JSON.stringify(config, null, 2));
