const element = require('../../index');
const {
  encodeJson,
  decodeJson,
  syncTransaction,
} = require('./func');
const { getDidDocumentModel, getCreatePayload } = require('./op');
const { resolve } = require('./protocol');

const getTestSideTree = () => {
  const db = new element.adapters.database.ElementRXDBAdapter({
    name: 'element-test',
    adapter: 'memory',
  });

  const storage = element.storage.ipfs.configure({
    multiaddr: '/ip4/127.0.0.1/tcp/5001',
  });

  const blockchain = element.blockchain.ethereum.configure({
    mnemonic: 'hazard pride garment scout search divide solution argue wait avoid title cave',
    hdPath: "m/44'/60'/0'/0/0",
    providerUrl: 'http://localhost:8545',
    anchorContractAddress: '0x1DABA81D326Ae274d5b18111440a05cD9581b305',
  });

  const parameters = {
    maxOperationsPerBatch: 5,
    batchingIntervalInSeconds: 1,
  };

  const sidetree = new element.SidetreeV2({
    db,
    storage,
    blockchain,
    parameters,
  });
  return sidetree;
};

const changeKid = (payload, newKid) => {
  const header = decodeJson(payload.protected);
  const newHeader = {
    ...header,
    kid: newKid,
  };
  return {
    ...payload,
    protected: encodeJson(newHeader),
  };
};

const getDidDocumentForPayload = async (sidetree, payload, didUniqueSuffix) => {
  const transaction = await sidetree.batchScheduler.writeNow(payload);
  await syncTransaction(sidetree, transaction);
  const didDocument = await resolve(sidetree)(didUniqueSuffix);
  return didDocument;
};

const getCreatePayloadForKeyIndex = async (mks, index) => {
  const primaryKey = await mks.getKeyForPurpose('primary', index);
  const recoveryKey = await mks.getKeyForPurpose('recovery', index);
  const didDocumentModel = getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey);
  return getCreatePayload(didDocumentModel, primaryKey);
};

module.exports = {
  getTestSideTree,
  changeKid,
  getDidDocumentForPayload,
  getCreatePayloadForKeyIndex,
};
