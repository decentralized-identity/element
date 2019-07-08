CONFIG_PATH=$1;

ELEMENT_CONTRACT_ADDRESS=$(cat ./node_modules/@transmute/element-lib/build/contracts/SimpleSidetreeAnchor.json| jq -r '.networks["133700"].address')

echo '👷 Modifying ' $CONFIG_PATH
echo '✅ element.ethereum.anchor_contract_address: ' $ELEMENT_CONTRACT_ADDRESS
echo ''

tmp=$(mktemp)
jq ".element.ethereum.anchor_contract_address = \"$ADDRESS\"" $CONFIG_PATH > "$tmp" && mv "$tmp" $CONFIG_PATH
