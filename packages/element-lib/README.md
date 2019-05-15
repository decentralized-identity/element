# @transmute/element-lib

```
npm i @transmute/element-lib --save
```
## Element Lib

This javacript package handles all protocol operations and cryptographic implementation needed to support sidetree ethereum. [sidetree-core](https://github.com/decentralized-identity/sidetree/tree/master/lib), is moving this direction, but does not currently publish a usable npm package, so we had to reimplement this functionality. This might be good for the protcol from a diversity perspective, but we'd like to be able to share code, and not worry about implementation differences.

## Storage and Blockchain

This library exposes interfaces for storing anchorFile and batchFiles, as well as creating Sidetree Transactions on a blockchain. Currently we publically support IPFS and Ethereum, but it is possible to create Private DIDs, by being creative here.

#### Contract Addresses

[Ropsten Element DID](https://ropsten.etherscan.io/address/0xD49Da2b7C0A15f6ac5A856f026D68A9B9848D96f)


##### Getting the Local Contract Address

```
cat ./build/contracts/SimpleSidetreeAnchor.json| jq -r '.networks["133700"].address'
```