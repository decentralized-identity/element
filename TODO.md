{ code: 'TypeError',
message: 'Cannot read property \'batchFileHash\' of null' }

      handle missing values better...

intialization needs to be refactored... no async init....

NO GLOBALS

```js

const element = require('@transmute/element-lib')

const blockchain = element.ethereum.configure({
      mneumonic,
      hdPath,
      providerUrl
      anchorContractAddress
})

const storage = element.ipfs.configure({
      multiaddr
})

const storage = element.local.configure(
      repo
)

element.configure({
      blockchain
      storage
})

```
