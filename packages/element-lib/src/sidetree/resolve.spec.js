const getLocalSidetree = require('../__tests__/__fixtures__/getLocalSidetree');
const fixtures = require('../__tests__/__fixtures__');

jest.setTimeout(20 * 1000);

let sidetree;

beforeAll(async () => {
  sidetree = await getLocalSidetree('sidetree.getTransactions');
});

afterAll(async () => {
  await sidetree.close();
});

describe('sidetree.resolve', () => {
  // it('should return null when no data is available', async () => {
  //   const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  //   expect(didDoc).toBe(null);
  // });

  // 1600ms lag time...
  it('can resolve a specific did', async () => {
    await sidetree.createTransactionFromRequests(
      fixtures.operationGenerator.createDID(fixtures.primaryKeypair, fixtures.recoveryKeypair),
    );

    // sidetree.serviceBus.on('element:sidetree:operation', async ({ operation }) => {
    //   const dbTxns = await sidetree.db.readCollection('element:sidetree:transaction');
    //   expect(dbTxns.length).toBe(1);
    //   const dbAnchorFiles = await sidetree.db.readCollection('element:sidetree:anchorFile');
    //   expect(dbAnchorFiles.length).toBe(1);
    //   const dbBatchFiles = await sidetree.db.readCollection('element:sidetree:batchFile');
    //   expect(dbBatchFiles.length).toBe(1);
    //   const dbOps = await sidetree.db.readCollection('element:sidetree:operation');
    //   expect(dbOps.length).toBe(1);
    //   expect(dbOps[0].operation.operationHash).toBe(operation.operationHash);
    //   done();
    // });

    const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
    expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  });

  // it('can resolve a specific did from cache', async () => {
  //   const didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  //   expect(didDoc.id).toBe('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  //   // const cachedDoc = await sidetree.db.read(
  //   //   'element:sidetree:did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
  //   // );
  //   // console.log(cachedDoc);
  // });

  // it('can resolve a specific did with new updates & cache', async () => {
  //   await sidetree.createTransactionFromRequests(
  //     fixtures.operationGenerator.updateRecoveryKey(
  //       'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
  //       fixtures.recoveryKeypair2,
  //       fixtures.primaryKeypair2,
  //       fixtures.recoveryKeypair,
  //     ),
  //   );
  //   // expire cache
  //   await sidetree.sleep(3);

  //   let didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  //   expect(didDoc.publicKey[0].publicKeyHex).toBe(fixtures.primaryKeypair2.publicKey);

  //   didDoc = await sidetree.resolve('did:elem:MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI');
  //   expect(didDoc.publicKey[0].publicKeyHex).toBe(fixtures.primaryKeypair2.publicKey);
  // });

  // it('can resolve all dids', async () => {
  //   const tree = await sidetree.resolve();
  //   expect(Object.keys(tree)).toEqual([
  //     'MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI',
  //     'transactionTime',
  //   ]);

  //   expect(
  //     tree['MRO_nAwc19U1pusMn5PXd_5iY6ATvCyeuFU-bO0XUkI'].doc.publicKey[0].publicKeyHex,
  //   ).toEqual(fixtures.primaryKeypair2.publicKey);
  // });
});
