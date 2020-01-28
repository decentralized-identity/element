## Procedure for generating a new funded Ethereum mnemonic used by element-did.com

### 1. Create new keys

Run the following script in element-lib

```
➜ node packages/element-lib/rotate-keys.js
{ mnemonic:
   'bicycle hello hint science year fluid true tilt purchase inside grace wear' }
{ address: '0x36BA853234E69F93F65DaF51383916017B862031' }

```

It will output a new mnemonic and a corresponding address for the first account of this mnemonic

### 2. Fund the account

Visit [https://faucet.ropsten.be/](https://faucet.ropsten.be/) and paste the address.

Click on "Send me test Ether"

Visit [https://ropsten.etherscan.io/](https://ropsten.etherscan.io/) to check that the account is funded

### 3. Switch production keys

In the `packages/element-api` folder run

```
firebase functions:config:set element.ethereum.mnemonic='THE NEW MNEMONIC'
npm run deploy
```