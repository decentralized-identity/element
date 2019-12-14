import { withHandlers } from 'recompose';
import element from '@transmute/element-lib';

// FIXME
const sidetree = new element.SidetreeV2({});
const { func, op } = sidetree;

export default withHandlers({
  getMyDidUniqueSuffix: ({ wallet }) => async () => {
    const [primaryKey] = Object.values(wallet.data.keys);
    const didDocumentModel = op.getDidDocumentModel(primaryKey.publicKey, primaryKey.publicKey);
    const createPayload = await op.getCreatePayload(didDocumentModel, primaryKey);
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload);
    return didUniqueSuffix;
  },
  createDIDRequest: ({ wallet }) => async () => {
    const [primaryKey] = Object.values(wallet.data.keys);
    const didDocumentModel = op.getDidDocumentModel(primaryKey.publicKey, primaryKey.publicKey);
    const createPayload = await op.getCreatePayload(didDocumentModel, primaryKey);
    return createPayload;
  },
  createAddKeyRequest: ({ wallet }) => async (key, myDidDocument, previousOperationHash) => {
    const [primaryKey] = Object.values(wallet.data.keys);
    const didUniqueSuffix = element.op.getDidUniqueSuffix({
      primaryKey,
      recoveryPublicKey: primaryKey.publicKey,
    });
    const encodedPayload = element.func.encodeJson({
      didUniqueSuffix,
      previousOperationHash,
      patch: [
        {
          op: 'replace',
          path: `/publicKey/${myDidDocument.publicKey.length}`,
          value: {
            id: `#kid=${key.kid}`,
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: key.publicKey,
          },
        },
      ],
    });
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKey.privateKey);
    return {
      header: {
        operation: 'update',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
  },
  createRemoveKeyRequest: ({ wallet }) => async (key, myDidDocument, previousOperationHash) => {
    const [primaryKey] = Object.values(wallet.data.keys);
    const didUniqueSuffix = element.op.getDidUniqueSuffix({
      primaryKey,
      recoveryPublicKey: primaryKey.publicKey,
    });
    const keyIndex = myDidDocument.publicKey.map(k => k.publicKeyHex).indexOf(key.publicKey);
    const encodedPayload = element.func.encodeJson({
      didUniqueSuffix,
      previousOperationHash,
      patch: [
        {
          op: 'remove',
          path: `/publicKey/${keyIndex}`,
        },
      ],
    });
    const signature = element.func.signEncodedPayload(encodedPayload, primaryKey.privateKey);
    return {
      header: {
        operation: 'update',
        kid: '#primary',
        alg: 'ES256K',
      },
      payload: encodedPayload,
      signature,
    };
  },
});
