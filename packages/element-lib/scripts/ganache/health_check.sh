curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":0}' http://localhost:8545 | jq -r '.'
curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1e228837561e32a6ec1b16f0574d6a493edc8863", "latest"],"id":1}' http://localhost:8545 | jq -r '.'
