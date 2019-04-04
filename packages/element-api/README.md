# @transmute/element-api

Firebase Cloud Functions for Element DID

##### [Local API Docs](http://localhost:5002/element-did/us-central1/main/docs)


## Setting Environment Variables

```
firebase functions:config:set element.env=production
firebase functions:config:set element.commit=$(git log -1 --format="%H")


firebase functions:config:set element.ethereum.mnemonic='hazard pride garment scout search divide solution argue wait avoid title cave'

firebase functions:config:set element.ethereum.provider_url='http://localhost:8545'

firebase functions:config:set element.ipfs.multiaddr='/ip4/127.0.0.1/tcp/5001'

firebase functions:config:set element.ethereum.anchor_contract_address='0x128b72578baf00c9fbF1c4a5b57cd69c61De1dd1'

firebase functions:config:set element.ethereum.anchor_contract_address=$(cat ./node_modules/@transmute/element-lib/build/contracts/SimpleSidetreeAnchor.json| jq -r '.networks["133700"].address')

firebase functions:config:unset element.ethereum.mneumonic 


firebase functions:config:set element.sidetree.start_block='0'
firebase functions:config:set element.sidetree.max_batch_size='10'
firebase functions:config:set element.sidetree.batch_interval_in_seconds='10'

```


#### Scripts

Switching to a new local contract.

```
./scripts/set-new-anchor-contract.sh
```