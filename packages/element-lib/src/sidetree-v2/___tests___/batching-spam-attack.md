# Batching Spam Attack report

## Experiment

In this report we study the resilience of a Sidetree node against an attacker trying to spam the operation queue by submitting `create` operations.
The default value for `maxOperationsPerBatch` is 10000, therefore we will test with values up to 10000 (see table below)

The full experiment is done in `./batching-spam-attack.js` with:
- Ganache for the `blockchain` interface
- A local IPFS node for the `storage` interface
- The RXDB adapter for the `db` interface
- A MacBook Pro with 8Gg or RAM and a 2,3 GHz i5 processor

To run the experiment, run `node packages/element-lib/src/sidetree-v2/___tests___/batching-spam-attack.js`

## Results

| number of operations submitted | 10 | 100 | 1000 | 2000 | 5000 | 10000 
| - | -- | --- | ---- | ---- | ---- | -----
| Time for attacker to generate n operations | 0.141 | 0.1 | 0.751	| 1.386	 | 3.62   | 8.182
| Time for element to write a batch of n operations | 0.433 | 0.397 | 0.529 |	0.72	 | 1.172  | 2.016
| Time for observer to sync n operations | 0.188 | 0.914 | 8.027 |	15.526 | 44.651 | 77.412

From this table, we can see that the bottleneck is the sync time of the observer:
- Below 1000 operations / batch, the time for the observer to sync is about half of the average blocktime on Ethereum (15s), therefore the node could keep up with the attack. 
- After 2000 operations / batch, the time for the observer to sync all operations becomes larger than the blocktime (up to 77s) therefore a continued attack on the node could DDOS it by preventing the observer from syncing every transaction

## Conclusion

Even if the maximum number of operations per batch is theoretically 10000, a node running on standard hardware would need to limit its operationQueue size to about 1000.

Considering an average block time of 15s (https://etherscan.io/chart/blocktime), that gives an effective throughput of 67 operations per second on standard hardware

Above that threshold, the full sync done by the observer cannot keep up, and a partial sync would need to be done at resolve time