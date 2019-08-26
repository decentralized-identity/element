# @transmute/element-api

Firebase Cloud Functions for Element DID

##### [Local API Docs](http://localhost:5002/element-did/us-central1/main/docs)

## Setting Environment Variables

```
firebase functions:config:set element.env=production
firebase functions:config:set element.commit=$(git log -1 --format="%H")

# Ethereum

firebase functions:config:set element.ethereum.mnemonic='hazard pride garment scout search divide solution argue wait avoid title cave'
firebase functions:config:set element.ethereum.provider_url='https://ropsten.infura.io/v3/<API_KEY>'
firebase functions:config:set element.ethereum.anchor_contract_address='0xD49Da2b7C0A15f6ac5A856f026D68A9B9848D96f'

# IPFS

firebase functions:config:set element.ipfs.multiaddr='/dns4/ipfs.infura.io/tcp/5001/https'

# Sidetree config

firebase functions:config:set element.sidetree.max_batch_size='10'
firebase functions:config:set element.sidetree.batch_interval_in_seconds='10'

firebase functions:config:unset element.ethereum.mneumonic

```

#### Scripts

Switching to a new local contract.

```
./scripts/set-new-anchor-contract.sh
```
