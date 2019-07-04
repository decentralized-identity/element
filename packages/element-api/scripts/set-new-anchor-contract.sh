# make sure to lerna bootstrap first
ADDRESS=$(cat ./node_modules/@transmute/element-lib/build/contracts/SimpleSidetreeAnchor.json| jq -r '.networks["133700"].address')

echo 'changing local contract address to: ' $ADDRESS

# firebase functions:config:set element.ethereum.anchor_contract_address=$ADDRESS

tmp=$(mktemp)
jq ".element.ethereum.anchor_contract_address = \"$ADDRESS\"" ./local.runtimeconfig.json > "$tmp" && mv "$tmp" ./local.runtimeconfig.json
