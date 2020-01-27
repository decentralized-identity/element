# Developer getting started guide

## 1) Setup the repository

```
git clone git@github.com:decentralized-identity/element.git
cd element
npm install
```

Element follows the [Mono Repo structure](#TODO). Running `npm install` will install dependencies in the top level npm project as well as in the following packages:

- [Element LIB](./packages/element-lib): Javascript SDK for using Element. Works with node 10, node 12 and in the browser
- [Element APP](./packages/element-app): Progressive Web App to create a wallet, create a DID, add and remove keys, search through the Element Block explorer, etc... The PWA allows you to use two different types of Sidetree nodes:
    - The light node (or browser node) which uses element-lib in the browser for Sidetree operations and interacts with Ethereum through [Metamask]() Make sure you have the Metamask browser extension installed if you want to use it the light node.
    - The full node which uses element-api for Sidetree operations
- [Element API](./packages/element-api): API powered by element-lib that exposes Sidetree operations with an HTTP interface. See [Swagger documentation](TODO) for more details.

## 2) How to use element-lib

```
cd packages/element-lib
```

### Running the tests

In order to run the tests, you need to start Element services

```
npm run services:start
```

This will start 3 services:

- [Ganache](): A local Ethereum chain initialized with the [Element smart contract]() running with on port 8545
- [IPFS](): A local IPFS node running on port 5001
- [CouchDB](): A local CouchDB instance running on port 5984. CouchDB will be ran in the Docker container, so you will need Docker installed. If you don't have it and / or don't want to install it, it is fine. Just be aware that the CouchDB tests will fail

Check that services are properly initalized with
```
npm run services:healthcheck
```

Then you can run the tests (note that running this command will initialize the services if they have not been initialized)

```
npm test
```

When you are done, you can stop the Element services by running

```
npm run services:stop
```

### Initializing the Sidetree class

In order to use element-lib in node or in the browser, you will need to initalize the Sidetree class by providing three interfaces:

- A `db` interface: this is where all the caching artifacts will be stored. While caching is not technically required for Element to work, CRUD operations will be prohibitively slow without it. To initialize, chose one db adapter (several options are available [here](./packages/element-lib/src/adapters/database)):
    - [RXDB](TODO)
    - [CouchDB](TODO)
    - [Firestore]: A good option if you're going to use Element in a [Firebase Cloud Function](), pretty slow otherwise. Also note that this technology is proprietary as opposed to the two above which are open source..

- A `storage` interface: the Content Addressed Storage layer where Sidetree operation data will be stored. To initialize, chose one storage adapter (several options are available [here](./packages/element-lib/src/adapters/storage)):
    - IPFS
    - IPFS Storage Manager: A layer on top of IPFS that uses a cache and some retry logic when the call to IPFS fails: This one is recommended for production use as the IPFS link provided by Infura tend to fail intermittently

- A `blockchain` interface: An interface for the decentralized ledger to be used for anchoring Sidetree operations. Element may only be used with the [Ethereum interface](./packages/element-lib/src/adapters/blockchain), however feel free to reuse this codebase to implement a did method that uses a different ledger.

See several examples for how to initialize the Sidetree class:
- [For a local node used for testing purposes](./packages/element-lib/src/__tests__/test-utils.js) : uses RXDB for in memory cache, local IPFS node for the storage interface, and local Ethereum node for the blockchain interface
- [For a production node running in nodeJS](./packages/element-api/src/services/sidetree.js): uses Firestore for the cache, IPFS Storage Manager for the storage interface, and Infura Ropsten for the blockchain interface
- [For a production node running in the browser](./packages/element-app/src/services/sidetree.js): uses RXDB for in browser cache, IPFS Storage Manager for the storage interface and Metamask for the blockchain interface

### Using element-lib to Create Read Update Delete DIDs

Once you have an instance of the Sidetree class with the suitable adapters, you can access all the helper functions (`sidetree.func`) and perform CRUD operations (`sidetree.op`). Here are a few code snippet to get you started:

#### Create a DID

```js
const { Sidetree } = require('@transmute/element-lib');

// Instantiate the Sidetree class
const element = new Sidetree(/* See previous section for how to initialize the Sidetree class*/);

// Generate a simple did document model
const mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic());
const primaryKey = await mks.getKeyForPurpose('primary', 0);
const recoveryKey = await mks.getKeyForPurpose('recovery', 0);
const didDocumentModel = element.op.getDidDocumentModel(
  primaryKey.publicKey,
  recoveryKey.publicKey
);

// Generate Sidetree Create payload
const createPayload = await element.op.getCreatePayload(didDocumentModel, primaryKey);

// Create the Sidetree transaction.
// This can potentially take a few minutes if you're not on a local network
const createTransaction = await element.batchScheduler.writeNow(createPayload);
const didUniqueSuffix = element.func.getDidUniqueSuffix(createPayload);
const did = `did:elem:${didUniqueSuffix}`;
console.log(`${did} was successfully created`);
```

#### Read a DID (aka resolve a DID)

```js
const didDocument = await element.resolve(didUniqueSuffix, true);
console.log(`${did} was successfully resolved into ${JSON.stringify(didDocument, null, 2)}`);
```

#### Update a DID document

Add a new key to the did document

```js
// Get last operation data
const operations = await element.db.readCollection(didUniqueSuffix);
const lastOperation = operations.pop();

// Generate update payload for adding a new key
const newKey = await mks.getKeyForPurpose('primary', 1);
const newPublicKey = {
  id: '#newKey',
  usage: 'signing',
  type: 'Secp256k1VerificationKey2018',
  publicKeyHex: newKey.publicKey,
};
const payload = await element.op.getUpdatePayloadForAddingAKey(
  lastOperation,
  newPublicKey,
  primaryKey.privateKey
);

// Create the Sidetree transaction.
const transaction = await element.batchScheduler.writeNow(payload);
const newDidDocument = await element.resolve(didUniqueSuffix, true);
console.log(`${JSON.stringify(newDidDocument, null, 2)} has a new publicKey`)
```

#### Recover a did document

How to recover a did document using the recovery key if the private key is lost:

```js
// Generate a recovery payload with the inital did document model
const recoveryPayload = await element.op.getRecoverPayload(
  didUniqueSuffix,
  didDocumentModel,
  recoveryKey.privateKey
);

// Send Sidetree transaction
const transaction = await element.batchScheduler.writeNow(recoveryPayload);
const recoveredDidDocument = await element.resolve(didUniqueSuffix, true);
console.log(`${JSON.stringify(recoveredDidDocument, null, 2)} was recovered`)
```

#### Delete a did document

```js
// Generate a delete payload this will brick the did forever
const deletePayload = await element.op.getDeletePayload(
  didUniqueSuffix,
  recoveryKey.privateKey
);

// Send Sidetree transaction
const deleteTransaction = await element.batchScheduler.writeNow(deletePayload);
const deletedDidDocument = await element.resolve(didUniqueSuffix, true);
console.log(`${JSON.stringify(deletedDidDocument, null, 2)} was delete`)
```