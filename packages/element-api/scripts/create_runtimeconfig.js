const path = require('path');
const fs = require('fs');
// eslint-disable-next-line
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  element: {
    commit: 'local',
    ipfs: {
      multiaddr: process.env.ELEMENT_IPFS_MULTIADDR || '/ip4/127.0.0.1/tcp/5001',
    },
    ethereum: {
      anchor_contract_address: '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
      provider_url: process.env.ELEMENT_PROVIDER || 'http://localhost:8545',
      mnemonic:
        process.env.ELEMENT_MNEMONIC
        || 'hazard pride garment scout search divide solution argue wait avoid title cave',
    },
    sidetree: {
      start_block: '0',
      max_batch_size: '10',
      batch_interval_in_seconds: '1',
    },
    env: 'local',
  },
};

const dir = path.resolve(__dirname, '..');

// eslint-disable-next-line
if (!fs.existsSync(dir)) {
  // eslint-disable-next-line
  fs.mkdirSync(dir);
}

// eslint-disable-next-line
fs.writeFileSync(
  path.resolve(__dirname, '../.runtimeconfig.json'),
  JSON.stringify(config, null, 2),
);
