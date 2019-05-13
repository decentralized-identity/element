# element

[![Build Status](https://travis-ci.org/decentralized-identity/element.svg?branch=master)](https://travis-ci.org/decentralized-identity/element) [![codecov](https://codecov.io/gh/decentralized-identity/element/branch/master/graph/badge.svg)](https://codecov.io/gh/decentralized-identity/element)

#### 🔥 Experimental Sidetree Protocol based DID Method `elem` with Ethereum and IPFS

### [See our blog post](https://medium.com/transmute-techtalk/introducing-element-328b4260e757)

Click below image for demo video.

[![Element Testnet Demo](./BrowserDemo.png)](https://www.youtube.com/watch?v=KY_dt2tKQxw)

This is a lerna mono repo, see [packages](./packages) for all modules.

See also [ion](https://github.com/decentralized-identity/ion), [sidetree-core](https://github.com/decentralized-identity/sidetree-core), [sidetree-ethereum](https://github.com/decentralized-identity/sidetree-ethereum), [sidetree-ipfs](https://github.com/decentralized-identity/sidetree-ipfs).

See [.travis.yml](./.travis.yml) for setup and test commands.

```
npm i
npm run bootstrap
npm run test:contracts
npm run contracts:migrate:dev
npm run test
```
