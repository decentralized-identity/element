import { withHandlers } from 'recompose';
import config from '../../config';

export default withHandlers({
  predictDID: ({ set, sidetree, getMyDidUniqueSuffix }) => async () => {
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    set({
      predictedDID: `${config.DID_METHOD_NAME}:${didUniqueSuffix}`,
    });
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    const orderedOperations = sidetree.func.getOrderedOperations(operations);
    set({ sidetreeOperations: orderedOperations });
  },
  getOperationsForDidUniqueSuffix: ({
    sidetree,
    set,
  }) => async didUniqueSuffix => {
    set({ loading: true });
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ didDocumentForOperations: myDidDocument });
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    const orderedOperations = sidetree.func.getOrderedOperations(operations);
    set({ sidetreeOperations: orderedOperations, loading: false });
  },
  createDID: ({
    doSetTmuiProp,
    sidetree,
    createDIDRequest,
    getMyDidUniqueSuffix,
    set,
  }) => async () => {
    set({ resolving: true });
    doSetTmuiProp({
      snackBarMessage: {
        message: 'Creating your DID will take a few minutes....',
        variant: 'info',
        open: true,
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    const createReq = await createDIDRequest();
    await sidetree.batchScheduler.writeNow(createReq);
    doSetTmuiProp({
      snackBarMessage: {
        message: 'DID Created... Resolving....',
        variant: 'info',
        open: true,
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    doSetTmuiProp({
      snackBarMessage: {
        message: `Resolved ${myDidDocument.id.substring(0, 24)}...`,
        variant: 'success',
        open: true,
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    set({ resolving: false });
  },
  addKeyToDIDDocument: ({
    doSetTmuiProp,
    getMyDidUniqueSuffix,
    createAddKeyRequest,
    getDidDocumentKey,
    set,
    sidetree,
  }) => async newKey => {
    set({ resolving: true });
    const newPublicKey = getDidDocumentKey(newKey);
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    const orderedOperations = sidetree.func.getOrderedOperations(operations);
    const lastOperation = orderedOperations.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createAddKeyRequest(
      newPublicKey,
      didUniqueSuffix,
      operationHash
    );
    doSetTmuiProp({
      snackBarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    await sidetree.batchScheduler.writeNow(updatePayload);
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    doSetTmuiProp({
      snackBarMessage: {
        message: 'Key added.',
        variant: 'success',
        open: true,
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    set({ resolving: false });
  },
  removeKeyFromDIDDocument: ({
    doSetTmuiProp,
    getMyDidUniqueSuffix,
    createRemoveKeyRequest,
    set,
    sidetree,
  }) => async kid => {
    set({ resolving: true });
    const didUniqueSuffix = await getMyDidUniqueSuffix();
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    const orderedOperations = sidetree.func.getOrderedOperations(operations);
    const lastOperation = orderedOperations.pop();
    const { operationHash } = lastOperation.operation;
    const updatePayload = await createRemoveKeyRequest(
      kid,
      didUniqueSuffix,
      operationHash
    );
    doSetTmuiProp({
      snackBarMessage: {
        message: 'This will take a few minutes....',
        variant: 'info',
        open: true,
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    await sidetree.batchScheduler.writeNow(updatePayload);
    const myDidDocument = await sidetree.resolve(didUniqueSuffix, true);
    set({ myDidDocument });
    doSetTmuiProp({
      snackBarMessage: {
        message: 'Key removed.',
        variant: 'success',
        open: true,
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 5000,
      },
    });
    set({ resolving: false });
  },
  getSidetreeTransactions: ({ sidetree, set }) => async ({ limit }) => {
    set({ loading: true });
    const data = await sidetree.getTransactions({ limit });
    set({ sidetreeTxns: data.reverse(), loading: false });
  },
  getAll: ({ doSetTmuiProp, sidetree, set }) => async () => {
    set({ resolving: true });
    try {
      const data = await sidetree.db.readCollection('did:documentRecord');
      const getTransactionTime = record =>
        record.record.lastTransaction.transactionTime;
      data.sort((a, b) => getTransactionTime(b) - getTransactionTime(a));
      set({ documentRecords: data });
      doSetTmuiProp({
        snackBarMessage: {
          message: 'Resolved sidetree.',
          variant: 'info',
          open: true,
          vertical: 'top',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    } catch (e) {
      doSetTmuiProp({
        snackBarMessage: {
          message: 'Could not resolve sidetree.',
          variant: 'error',
          open: true,
          vertical: 'top',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    }
    set({ resolving: false });
  },
  resolveDID: ({ didResolved, sidetree, doSetTmuiProp, set }) => async did => {
    set({ resolving: true });
    try {
      const doc = await sidetree.resolve(did, true);
      if (doc) {
        didResolved({ didDocument: doc });
        doSetTmuiProp({
          snackBarMessage: {
            message: `Resolved ${doc.id.substring(0, 24)}...`,
            variant: 'success',
            open: true,
            vertical: 'top',
            horizontal: 'right',
            autoHideDuration: 5000,
          },
        });

        const operations = await sidetree.db.readCollection(
          doc.id.split(':').pop()
        );
        const orderedOperations = sidetree.func.getOrderedOperations(
          operations
        );
        set({ sidetreeOperations: orderedOperations });
      }
    } catch (e) {
      doSetTmuiProp({
        snackBarMessage: {
          message: `Could not resolve DID, make sure it is of the form ${
            config.DID_METHOD_NAME
          }:didUniqueSuffix.`,
          variant: 'error',
          open: true,
          vertical: 'top',
          horizontal: 'right',
          autoHideDuration: 5000,
        },
      });
    }
    set({ resolving: false });
  },
  getSidetreeOperationsFromTransactionHash: ({
    sidetree,
    set,
  }) => async transactionHash => {
    set({ loading: true });
    const summary = await sidetree.getTransactionSummary(transactionHash);
    set({ sidetreeTransactionSummary: summary, loading: false });
  },
});
