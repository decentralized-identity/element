const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(10 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.resolve');
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.resolve', () => {
  beforeAll(async () => {
    await sidetree.createTransactionFromRequests(
      fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
    );
  });

  it('cache / db are not populated', async () => {
    const dbTxns = await sidetree.db.readCollection('element:sidetree:transaction');
    expect(dbTxns.length).toBe(0);
    const dbAnchorFiles = await sidetree.db.readCollection('element:sidetree:anchorFile');
    expect(dbAnchorFiles.length).toBe(0);
    const dbBatchFiles = await sidetree.db.readCollection('element:sidetree:batchFile');
    expect(dbBatchFiles.length).toBe(0);
    const dbOps = await sidetree.db.readCollection('element:sidetree:operation');
    expect(dbOps.length).toBe(0);
    const record = await sidetree.db.read(
      'element:sidetree:did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
    );
    expect(record).toBe(null);
    const didDocumentRecords = await sidetree.db.readCollection(
      'element:sidetree:did:documentRecord',
    );
    expect(didDocumentRecords.length).toBe(0);
  });

  // 1600ms lag time...
  it('on first resolve', async () => {
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('on second resolve', async () => {
    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  it('cache / db are populated', async () => {
    const dbTxns = await sidetree.db.readCollection('element:sidetree:transaction');
    expect(dbTxns.length).toBe(1);
    const dbAnchorFiles = await sidetree.db.readCollection('element:sidetree:anchorFile');
    expect(dbAnchorFiles.length).toBe(1);
    const dbBatchFiles = await sidetree.db.readCollection('element:sidetree:batchFile');
    expect(dbBatchFiles.length).toBe(1);
    const dbOps = await sidetree.db.readCollection('element:sidetree:operation');
    expect(dbOps.length).toBe(1);
    const { record } = await sidetree.db.read(
      'element:sidetree:did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
    );
    expect(record.doc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    const didDocumentRecords = await sidetree.db.readCollection(
      'element:sidetree:did:documentRecord',
    );
    expect(didDocumentRecords.length).toBe(1);
  });
});
