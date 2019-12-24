# Spam Attack report

## Experiment

In this report we study the resilience of a Sidetree node against an attacker trying to spam the operation queue by submitting `create` operations.
The default value for `maxOperationsPerBatch` is 10000, therefore we will test with values up to 10000 (see table below)
We also use the result to compare two implementations of the syncing process
- The "full sync": a process observes the blockchain and writes every single operation to the cache as they are published
- The "just in time" sync: the sync is performed at resolve time by scanning the blockchain and syncing only the operations related to the didUniqueSuffix being resolved

The full experiment is done in `./batching-spam-attack.js` with:
- Ganache for the `blockchain` interface
- A local IPFS node for the `storage` interface
- The RXDB adapter for the `db` interface
- A MacBook Pro with 8Gg or RAM and a 2,3 GHz i5 processor

To run the experiment, run `node packages/element-lib/src/sidetree/___tests___/batching-spam-attack.js`

## Results for the full sync node

Each time value is expressed in seconds

| number of operations submitted | 10 | 100 | 1000 | 2000 | 5000 | 10000 
| - | -- | --- | ---- | ---- | ---- | -----
| Time for attacker to generate n operations | 0.141 | 0.1 | 0.751	| 1.386	 | 3.62   | 8.182
| Time for element to write a batch of n operations | 0.433 | 0.397 | 0.529 |	0.72	 | 1.172  | 2.016
| Time for observer to sync n operations (full sync) | 0.188 | 0.914 | 8.027 |	15.526 | 44.651 | 77.412
| Time for resoling a did | 0.01 | 0.009 | 0.021 | 0.008 | 0.013 | 0.013

From this table, we can see that the bottleneck is the sync time of the observer:
- Below 1000 operations / batch, the time for the observer to sync is about half of the average blocktime on Ethereum (15s), therefore the node could keep up with the attack. 
- After 2000 operations / batch, the time for the observer to sync all operations becomes larger than the blocktime (up to 77s) therefore a continued attack on the node could DDOS it by preventing the observer from syncing every transaction

## Results for the just in time sync node

| number of operations submitted | 10 | 100 | 1000 | 2000 | 5000 | 10000 
| - | -- | --- | ---- | ---- | ---- | -----
| Time for attacker to generate n operations | 0.087 | 0.163 | 0.765 | 1.76 | 3.3 | 6.105
| Time for element to write a batch of n operations | 1.039 | 0.468 | 0.61 | 0.865 | 1.188 | 1.562
| Time for resolving a did with just in time sync | 0.648s | 0.432 | 0.406 | 0.597 | 0.577 | 0.871

From this table we see that both the time to write the batch and the time to resolve a did with just in time sync are much faster than blocktime, therefore an attacker cannot spam a Sidetree node.
However the tradeoff is that resolving a DID is much slower, compared to the instant resolve time of the full sync node, it takes between half a second and a second using a local network to resolve a DID. On ropsten using Infura, the resolve time varies from one to three seconds.

## Conclusion

Even if the maximum number of operations per batch is theoretically 10000, a full sync node running on standard hardware would need to limit its operationQueue size to about 1000. Considering an average block time of 15s (https://etherscan.io/chart/blocktime), that gives an effective throughput of 67 operations per second on standard hardware

However a just in time node is only limited by the value of the maximum number of operations per batch. Using the default value of 10.000, that gives a throughput of 667 operations per second using a just in time node. However the tradeoff is that each did is slower to resolve.
