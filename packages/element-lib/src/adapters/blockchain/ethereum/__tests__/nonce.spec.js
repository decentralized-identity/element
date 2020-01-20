const element = require('../../../../../index');
const config = require('../../../json/config.local.json');

jest.setTimeout(10 * 1000);
it('can write from 2 services to 2 contracts', async () => {
  const blockchain1 = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.mnemonic,
    providerUrl: config.web3ProviderUrl,
    // when not defined, a new contract is created.
    // anchorContractAddress: config.anchorContractAddress,
  });
  await blockchain1.resolving;

  const blockchain2 = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.mnemonic,
    providerUrl: config.web3ProviderUrl,
    // when not defined, a new contract is created.
    // anchorContractAddress: config.anchorContractAddress,
  });
  await blockchain2.resolving;

  const txn1 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn2 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn3 = await blockchain2.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn4 = await blockchain2.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn5 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn6 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );

  const c1Txns = await blockchain1.getTransactions(0, 'latest', {
    omitTimestamp: true,
  });
  expect(c1Txns).toEqual([txn1, txn2, txn5, txn6]);

  const c2Txns = await blockchain2.getTransactions(0, 'latest', {
    omitTimestamp: true,
  });
  expect(c2Txns).toEqual([txn3, txn4]);
});

it('can write from 2 services to 1 contracts', async () => {
  const blockchain1 = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.mnemonic,
    providerUrl: config.web3ProviderUrl,
    // when not defined, a new contract is created.
    // anchorContractAddress: config.anchorContractAddress,
  });
  await blockchain1.resolving;

  const blockchain2 = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.mnemonic,
    providerUrl: config.web3ProviderUrl,
    anchorContractAddress: blockchain1.anchorContractAddress,
  });

  const txn1 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn2 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn3 = await blockchain2.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn4 = await blockchain2.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn5 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );
  const txn6 = await blockchain1.write(
    'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
  );

  const c1Txns = await blockchain1.getTransactions(0, 'latest', {
    omitTimestamp: true,
  });
  expect(c1Txns).toEqual([txn1, txn2, txn3, txn4, txn5, txn6]);

  const c2Txns = await blockchain2.getTransactions(0, 'latest', {
    omitTimestamp: true,
  });
  expect(c2Txns).toEqual([txn1, txn2, txn3, txn4, txn5, txn6]);
});
