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

#### If you're using EC2

We recommend using

- Ubuntu Server 18.04 LTS
- a t2.small instance or equivalent (1 vCPU, 2GB of RAM and 8 GB of Disk)

To setup, run the following commands:

```
# Update packaging tool
sudo apt update
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
# Install node
nvm install v10.16.0
# Install other required dependencies
sudo apt install python build-essential jq
```

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
