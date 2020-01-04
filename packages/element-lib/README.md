# @transmute/element-lib

```
npm i @transmute/element-lib --save
```

## Element Lib

This javacript package handles all protocol operations and cryptographic implementation needed to support sidetree ethereum. [sidetree-core](https://github.com/decentralized-identity/sidetree/tree/master/lib), is moving this direction, but did not at the time currently publish a library like this as an npm package, so we had to reimplement this functionality. This might be good for the protocol from a diversity perspective, but we'd like to be able to share code, and not worry about implementation differences. For now, we think its best that the focus be on devex and speed for both ethereum and bitcoin implementations of Sidetree...

### Integration

When working with element as a dependency of another project, you may find it useful to link accross the mono repo:

```
# inside element/packages/element-lib
npm link
# inside your_project/packages/your_app
npm link @transmute/element-lib
```

Now you can confirm your working changes to element work with your app before pushing a PR to element.

#### Contract Addresses

[Ropsten Element DID](https://ropsten.etherscan.io/address/0xD49Da2b7C0A15f6ac5A856f026D68A9B9848D96f)

##### Getting the Local Contract Address

```
cat ./SimpleSidetreeAnchor.json| jq -r '.networks["133700"].address'
```
