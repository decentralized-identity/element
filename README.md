# Element

[![Build Status](https://travis-ci.org/decentralized-identity/element.svg?branch=master)](https://travis-ci.org/decentralized-identity/element) [![codecov](https://codecov.io/gh/decentralized-identity/element/branch/master/graph/badge.svg)](https://codecov.io/gh/decentralized-identity/element)

#### 🔥 Experimental Sidetree Protocol based DID Method `elem` with Ethereum and IPFS

### [See the DID method specification](./docs/did-method-spec/spec.md)

### [See our blog post](https://medium.com/transmute-techtalk/introducing-element-328b4260e757)

Click below image for demo video.

[![Element Testnet Demo](./BrowserDemo.png)](https://www.youtube.com/watch?v=KY_dt2tKQxw)

This is a lerna mono repo, see [packages](./packages) for all modules.

See also [ion](https://github.com/decentralized-identity/ion), [sidetree](https://github.com/decentralized-identity/sidetree), [sidetree-ethereum](https://github.com/decentralized-identity/sidetree-ethereum).

- [Web App](https://element-did.com)
- [API Docs](https://element-did.com/api/docs)
- [React Storybook](https://storybook.element-did.com)

- [Current Anchor Contract](https://ropsten.etherscan.io/address/0xD49Da2b7C0A15f6ac5A856f026D68A9B9848D96f)

## Getting Started

#### Clone the repo:

```
git clone git@github.com:decentralized-identity/element.git
cd element
```

#### Install:

```
npm i
```

#### Run smart contract tests:

```
npm run test:contracts
```

#### Run lib, api and app tests:

```
npm run test
```

#### Lint

```
npm run lint
```

#### Coverage

```
npm run coverage
```

#### Publishing

If you have 2fa enabled for npm (and you should!).

```
lerna version patch
NPM_CONFIG_OTP=123456 lerna publish
```

#### Testing Documentation

```
npm i -g http-server
serve ./docs
```

See [.travis.yml](./.travis.yml) for setup and test commands for linux.
