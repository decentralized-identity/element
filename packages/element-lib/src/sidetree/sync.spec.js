const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.sync');
});

afterAll(async () => {
  await sidetree.close();
});

let txn1;

describe('sidetree.sync', () => {
  beforeAll(async () => {
    txn1 = await sidetree.createTransactionFromRequests(
      fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
    );
  });

  it('sync', async (done) => {
    let syncJob;

    sidetree.serviceBus.on('element:sidetree:sync:start', async () => {
      await sidetree.sleep(0.01); // wait for the sync to be written.
      syncJob = await sidetree.db.read('element:sidetree:sync');
      expect(syncJob.syncStartDateTime).toBeDefined();
      expect(syncJob.syncStopDateTime).toBeUndefined();
    });

    sidetree.serviceBus.on('element:sidetree:sync:stop', async () => {
      const dbTxns = await sidetree.db.readCollection('element:sidetree:transaction');
      expect(dbTxns.length).toBe(1);
      const dbAnchorFiles = await sidetree.db.readCollection('element:sidetree:anchorFile');
      expect(dbAnchorFiles.length).toBe(1);
      const dbBatchFiles = await sidetree.db.readCollection('element:sidetree:batchFile');
      expect(dbBatchFiles.length).toBe(1);
      const dbOps = await sidetree.db.readCollection('element:sidetree:operation');
      expect(dbOps.length).toBe(1);
      await sidetree.sleep(0.5); // wait for the sync to be written.
      syncJob = await sidetree.db.read('element:sidetree:sync');
      expect(syncJob.syncStartDateTime).toBeUndefined();
      expect(syncJob.syncStopDateTime).toBeDefined();
      const { record } = await sidetree.db.read(
        'element:sidetree:did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
      );
      expect(record.doc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
      const didDocumentRecords = await sidetree.db.readCollection(
        'element:sidetree:did:documentRecord',
      );
      expect(didDocumentRecords.length).toBe(1);
      done();
    });
    await sidetree.sync({
      fromTransactionTime: txn1.transactionTime,
      toTransactionTime: txn1.transactionTime,
    });
  });
});
