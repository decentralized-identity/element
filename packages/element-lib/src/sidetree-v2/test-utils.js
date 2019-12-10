const element = require('../../index');
const { encodeJson, decodeJson, syncTransaction } = require('./func');
const { create, resolve } = require('./protocol');

const getTestSideTree = () => {
  const db = new element.adapters.database.ElementRXDBAdapter({
    name: 'element-test',
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

  return new element.SidetreeV2({ db, storage, blockchain });
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
  const transaction = await create(sidetree)(payload);
  await syncTransaction(sidetree, transaction);
  const didDocument = await resolve(sidetree)(didUniqueSuffix);
  return didDocument;
};

module.exports = {
  getTestSideTree,
  changeKid,
  getDidDocumentForPayload,
};
