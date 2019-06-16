import { withHandlers } from 'recompose';
import element from '@transmute/element-lib';

export default withHandlers({
  getMyDidUniqueSuffix: ({ wallet }) => async () => {
    const [primaryKey] = Object.values(wallet.data.keys);
    return element.op.getDidUniqueSuffix({
      primaryKey,
      recoveryPublicKey: primaryKey.publicKey,
    });
  },
  createDIDRequest: ({ wallet }) => async () => {
    const [primaryKey] = Object.values(wallet.data.keys);
    return element.op.create({
      primaryKey,
      recoveryPublicKey: primaryKey.publicKey,
    });
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
